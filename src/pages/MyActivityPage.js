import React, { useState, useEffect } from 'react'
import { instance } from '../api'
import { useAddress } from '@thirdweb-dev/react'
import {
  CCardHeader,
  CButton,
  CCol,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { QrReader } from 'react-qr-reader';
import CIcon from '@coreui/icons-react'
import { cilLink } from '@coreui/icons'
import Spinner from '../components/Spinner';
import AddCircle from '../components/AddCircle'
const MyActivity = () => {
  const address = useAddress()
  const navigate = useNavigate();
  // const [keywords, setKeywords] = useState('')
  const [activities, setActivities] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState('No result');
  const [isModal, setIsModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const closeModal = () => {
    setSelectedActivity(null)
    setIsModal(false)
  }
  const handleScan = async (result, error) => {
    if (result) {

      const ciphertext = result.text;
      //decrypt
      const decrypted = await instance.post(`/crypto/decrypt`, { ciphertext, address })
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
          navigate('/Ticket/Own');
        }
      })
      .catch(error => {
        console.error("Error:", error);
        // Handle other errors as needed
      });
  }
  // const searchActivities = async (keywords) => { }
  // const handleEnter = async (e) => {
  //   if (e.key === 'Enter') {
  //     const filteredActivities = await searchActivities(keywords)
  //     setActivities(filteredActivities)
  //   }
  // }

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
  return (
    loading ? <Spinner /> : <div className="container d-flex flex-column justify-content-center align-items-center">
      {selectedActivity && (
        <CModal size="l" visible={isModal} onDismiss={closeModal} alignment="center" className='text-black'>
          <CModalHeader onClose={closeModal}>
            <CModalTitle>
              {selectedActivity.title}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <QrReader
              onResult={handleScan}
              style={{ width: '100%' }}
            />
          </CModalBody>
          <CModalFooter>
            <CButton
              color="success"
              onClick={ticketPass}
            >
              address : {data && data.split('/')[1]}<br />
              ticket name : {data && data.split('/')[2]}<br />
              ticket quantity : {data && data.split('/')[3]}
            </CButton>
          </CModalFooter>
        </CModal>
      )}
      <div>
        <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
          <h1 className='my-4'><b><u>My Events</u></b></h1>
        </CCardHeader>
        <div className="d-flex flex-wrap justify-content-center" style={{ gap: '1.3rem' }}>
          <AddCircle url={'/activity/Add'} />
          {activities.length === 0 ? <h1 className='text-center'>Activities not found</h1> : activities.map(activity => {
            const startSelling = new Date(activity.startSellTime) <= new Date()
            return (
              <div className='item-card' key={activity.id}>
                <div className="card shadow-sm h-100">
                  <img src={activity.image} alt="主視覺" className="card-img" height="250" />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between">
                      <CCol xs={7} className='p-0' >
                        <h3>
                          {activity.title}
                          <>{' '}</>
                          <a href={`https://goerli.etherscan.io/address/${activity.eventAddress}`} target='_blank' rel="noopener noreferrer">
                            <CIcon icon={cilLink} size='lg' />
                          </a>
                        </h3>
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
                          Date: {activity.date.split('T')[0]}
                        </p>
                        <p className="text-body-secondary m-0">
                          Registered: {activity.soldTickets} people
                        </p>
                      </div>
                      <div className='d-flex flex-column'>
                        {!startSelling && <CButton className="btn btn-warning mb-1 p-1">
                          開始售票
                        </CButton>}
                        {startSelling && <CButton className="btn btn-danger mb-1 p-1">
                          停止售票
                        </CButton>}
                        {activity.endSelling ? (<a
                          href={`/activity/${activity._id}`}
                          className={`btn btn-${startSelling ? 'success' : 'primary'} p-1`}
                        >
                          {startSelling ? '開賣中' : '檢視活動'}
                        </a>
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
      </div>
      <CButton className="more-activities">LOAD MORE</CButton>
    </div>
  )
}

export default MyActivity