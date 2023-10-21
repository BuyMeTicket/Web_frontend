import React, { useState, useEffect } from 'react'
import { instance } from '../api'
import { useAddress,useContract } from '@thirdweb-dev/react'
import {
  CCardHeader,
  CButton,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTooltip,
} from '@coreui/react'
import { useNavigate,Link } from 'react-router-dom'
import { QrReader } from 'react-qr-reader';
import CIcon from '@coreui/icons-react'
import { cilLink } from '@coreui/icons'
import Spinner from '../components/Spinner';
import AddCircle from '../components/AddCircle'
import Swal from 'sweetalert2'
const MyActivity = () => {
  const address = useAddress()
  const navigate = useNavigate();
  const [activities, setActivities] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState('No result');
  const [isModal, setIsModal] = useState(false)
  const [isModal2, setIsModal2] = useState(false)
  const [contractAddress, setContractAddress] = useState('0xea4024f934173cF0c550b6b68b19e1A40Dc477b5');
  const [selectedActivity, setSelectedActivity] = useState(null)
  
  const closeModal = () => {
    setSelectedActivity(null)
    setIsModal(false)
    setIsModal2(false)
  }
  const handleScan = async (result, error) => {
    if (result) {
      let cipherValue = result.text.split('/',1);
      const cipherAddress = cipherValue[0]?.toString()
      const ciphertext = result.text.replace(cipherAddress + '/', '')?.toString()
      //decrypt
      const decrypted = await instance.post(`/crypto/decrypt`, { ciphertext, address:cipherAddress })
      if (decrypted.data === 'Key expired.') {
        alert('Key expired.')
        return
      }
      if (decrypted.data === 'Key not found.') {
        alert('Key not found , Please refresh the QR code.')
        return
      }
      console.log(decrypted.data)
      setData(decrypted.data)
    }
    if (error) {
      console.error(error);
    }
  };
  const ticketPass = async () => {
    instance.post(`/ticket/use`, { data })
      .then((res) => {
        console.log(res.data);
        if (res.data === 'Ticket used.') {
          // Redirect to ticketpage
          Swal.fire({
            icon: 'success',
            title: 'Ticket used.',
            showConfirmButton: false,
            timer: 1500
          })
        }
      })
      .catch(error => {
        console.error("Error:", error);
        // Handle other errors as needed
      });
  }
  
  const withdrawing = async () => {
    console.log('Activity_contract',contractAddress)
    await Activity_contract.call("withdraw")
  }
  const getMyActivities = async () => {
    instance.get('/activity/own', { params: { holder: address } })
      .then((res) => {
        setActivities(res.data)
        setLoading(false)
      })
  }
  useEffect(() => {
    if (address) getMyActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    // Check if pool has a value and pool.address is defined
    if (selectedActivity && selectedActivity.eventAddress) {
      setContractAddress(selectedActivity.eventAddress);
    }
  }, [selectedActivity]);
  const { contract: Activity_contract } = useContract(contractAddress);
  return (
    loading ? <Spinner /> : <div className="container d-flex flex-column justify-content-center align-items-center">
      {selectedActivity && (
        <CModal size="l" visible={isModal} onClose={closeModal} alignment="center" className='text-black'>
          <CModalHeader onClose={closeModal}>
            <CModalTitle>
              {selectedActivity.title}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <QrReader
              onResult={handleScan}
              constraints={{ facingMode: "environment" }}
              style={{ width: '100%' }}
            />
          </CModalBody>
          <CModalFooter>
            <CButton
              color="success"
              onClick={ticketPass}
            >
              {data && data.split('/')[1]===address ? 'Pass' : 'Fail'}<br />
              ticket name : {data && data.split('/')[2]}<br />
              ticket quantity : {data && data.split('/')[3]}
            </CButton>
          </CModalFooter>
        </CModal>
      )}
      {selectedActivity && (
        <CModal size="l" visible={isModal2} onClose={closeModal} alignment="center" className='text-black'>
          <CModalHeader onClose={closeModal}>
            <CModalTitle>
              {selectedActivity.title}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p>您即將提款！！！</p>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="success"
              onClick={withdrawing}
            >
              提款
            </CButton>
          </CModalFooter>
        </CModal>
      )}
      <div>
        <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
          <h1 className='my-4'><b><u>My Events</u></b></h1>
        </CCardHeader>
        <div className="d-flex flex-wrap" style={{ gap: '1.3rem' }}>
          <AddCircle url={'/activity/Add'} />
          {activities.length !== 0 && activities.map(activity => {
            const startSelling = new Date(activity.startSellTime) <= new Date()
            const endSelling = new Date(activity.endSellTime)<new Date()
            return (
              <div className='item-card' key={activity.id}>
                <div className="card shadow-sm h-100">
                  <img src={activity.image} alt="主視覺" className="card-img" height="250" />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between">
                      <CCol xs={7} className='p-0' >
                        <div className='d-flex align-items-center'>
                          <CTooltip content={activity.title}>
                          <h4>
                            {activity.title}
                          </h4>
                          </CTooltip>
                          <a href={`https://goerli.etherscan.io/address/${activity.eventAddress}`} target='_blank' rel="noopener noreferrer" className='ml-2'>
                            <CIcon icon={cilLink} size='lg' />
                          </a>
                          <CTooltip content={activity.address}>
                            <CIcon icon='cil-location-pin' style={{minHeight:'1.1rem', minWidth:'1.1rem'}} size='lg' className='ml-2 mb-1' />
                          </CTooltip>
                        </div>
                        <p className="text-body-secondary m-0">
                          Date:{activity.date.split('T')[0]}
                        </p>
                      </CCol>
                      <CCol xs={4} className='p-0'>
                        <p className=' d-flex flex-column align-items-end justify-content-end'>
                          <span className='mb-1'>
                            {activity.watches} <CIcon icon='cil-user' />
                          </span>
                          {startSelling && <span>剩餘/總票數:<br />{activity.leftTickets}/{activity.totalTickets}</span>}
                        </p>
                      </CCol>
                    </div>
                    <div className="d-flex justify-content-between align-items-end">
                      <div>
                        <p className="text-body-secondary m-0">
                          Selling Date: <br/>
                          {activity.startSellTime.split('T')[0]} ~ {activity.endSellTime.split('T')[0]}
                        </p>
                        <p className="text-body-secondary m-0">
                          Registered: {activity.soldTickets} people
                        </p>
                      </div>
                      <div className='d-flex flex-column'>
                        {endSelling&&(
                        <CButton 
                          className="btn btn-warning mb-1 p-1"
                          onClick={() => {
                            setSelectedActivity(activity)
                            setIsModal2(true)
                          }}
                        >
                          提款
                        </CButton>)}
                        {!endSelling ? (<Link
                          to={`/activity/${activity._id}`}
                          className={`btn btn-${startSelling ? 'success' : 'primary'} p-1`}
                        >
                          {startSelling ? '開賣中' : '檢視活動'}
                        </Link>
                        ) : (
                          <button key={activity._id} className={`btn btn-${'success'}`} onClick={() => {
                            setSelectedActivity(activity)
                            setIsModal(true)
                          }}>
                            <nobr>驗票</nobr>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {activities.length === 0 && <h1 className='text-center my-3'>Events not found</h1>}
      </div>
      <CButton className="more-activities">LOAD MORE</CButton>
    </div>
  )
}

export default MyActivity