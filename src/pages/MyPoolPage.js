import React, { useState, useEffect } from 'react'
import { instance } from '../api'
import { useAddress, useContract } from '@thirdweb-dev/react'
import { Link } from 'react-router-dom'
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
import CIcon from '@coreui/icons-react'
import { cilLink } from '@coreui/icons'
import Spinner from '../components/Spinner'
import AddCircle from '../components/AddCircle'
const MyPool = () => {
  // const [keywords, setKeywords] = useState('')
  const address = useAddress()

  const [loading, setLoading] = useState(true)
  const [pools, setPools] = useState(null)
  const [contractAddress, setContractAddress] = useState('0xF5857Ef679be695c2dD22adC8D46ADdB41F6afa8');
  const [isModal, setIsModal] = useState(false)
  const [selectedPool, setSelectedPool] = useState(null)
  const openModal = (pool) => {
    setSelectedPool(pool)
    // setContractAddress(pool.address)
    console.log(pool)
    setIsModal(true)
  }
  const closeModal = () => {
    setIsModal(false)
    setSelectedPool(null)
  }
  function parseKValue(value) {
    if (typeof value === 'string' && value.endsWith('k')) {
      return parseFloat(value.replace('k', '')) * 1000;
    }
    return parseFloat(value);
  }
  function canWithdrawing(value, target) {
    const a = parseKValue(value)
    const b = parseKValue(target)
    return a >= b;
  }
  const percentage = (current, target) => {
    const currentPrice = parseKValue(current) || 0;
    const targetPrice = parseKValue(target) || 1;
    return Math.round((currentPrice / targetPrice) * 100)
  }
  useEffect(() => {
    // Check if pool has a value and pool.address is defined
    if (selectedPool && selectedPool.address) {
      setContractAddress(selectedPool.address);
    }
  }, [selectedPool]);
  const { contract: pool_contract } = useContract(contractAddress);
  // const searchPools = async (keywords) => { }
  // const handleEnter = async (e) => {
  //   if (e.key === 'Enter') {
  //     const filteredPools = await searchPools(keywords)
  //     setPools(filteredPools)
  //   }
  // }
  const getMyPools = async () => {
    instance.get('/pool/own', { params: { holder: address } })
      .then((res) => {
        setPools(res.data)
        setLoading(false)
      })
  }
  const withdrawing = async () => {
    await pool_contract.call("withdraw")
    closeModal()
  }
  function getColorByPercentage(percentage) {
    if (percentage > 60) {
      return '#ff0000'; // red color for >60%
    } else if (percentage > 30) {
      return '#f5d742'; // Yellow color for >30% and <=60%
    } else {
      return 'green'; // Green color for <=30%
    }
  }
  useEffect(() => {
    if (address) getMyPools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])
  return (
    loading ? <Spinner /> : <div className="container d-flex flex-column justify-content-center align-items-center">
      {selectedPool && (
        <CModal size="l" visible={isModal} onDismiss={closeModal} alignment="center" className='text-black'>
          <CModalHeader onDismiss={closeModal}>
            <CModalTitle>募資活動提款</CModalTitle>
          </CModalHeader>
          <CModalBody>
            當前選擇募資：{selectedPool.title}<br />
            目前已經募資 {selectedPool.currentPrice} / {selectedPool.targetPrice}，達 {percentage(selectedPool.currentPrice, selectedPool.targetPrice)} % <br />
            結束募資後，您將收到所有募資金額
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={closeModal}>
              回到上一頁
            </CButton>
            <CButton color="danger" onClick={withdrawing}>
              提款
            </CButton>
          </CModalFooter>
        </CModal>
      )}
      <div>
        <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
          <h1 className='my-4'><b><u>My Pools</u></b></h1>
        </CCardHeader>
        <div className="d-flex flex-wrap justify-content-center" style={{ gap: '1.3rem' }}>
          <AddCircle url={'/pool/Add'} />
          {pools.length !== 0 && pools.map((pool, index) => {
            const during = new Date() > new Date(pool.startTime) && new Date() < new Date(pool.endTime)
            const finish = new Date() > new Date(pool.endTime)
            return (
              <div className='item-card' key={pool.id}>
                <div className="card shadow-sm h-100">
                  <img src={pool.image} alt="主視覺" className="card-img" height="250" />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between">
                      <CCol xs={7} className='p-0' >
                        <h4>
                          {pool.title}
                          <>{' '}</>
                          <a href={`https://goerli.etherscan.io/address/${pool.address}`} target='_blank' rel="noopener noreferrer">
                            <CIcon icon={cilLink} size='lg' />
                          </a>
                        </h4>
                        <p style={{
                          fontFamily: 'Arial, sans-serif',
                          fontSize: '16px',
                          color: '#ffffff',
                          backgroundColor: getColorByPercentage(percentage(pool.currentPrice, pool.targetPrice)),
                          padding: '5px 10px',
                          borderRadius: '10px',
                          display: 'inline-block',
                          margin: '5px 0',
                          textAlign: 'center'
                        }}>
                          {percentage(pool.currentPrice, pool.targetPrice)}%
                        </p>
                      </CCol>
                      <CCol xs={4} className='p-0'>
                        <p className=' d-flex flex-column align-items-end justify-content-end'>
                          {during && <span>已累積/目標:<br />{pool.currentPrice}/{pool.targetPrice} USDT</span>}
                        </p>
                      </CCol>
                    </div>
                    <div className="d-flex justify-content-between align-items-end">
                      <div>
                        <p className="text-body-secondary m-0">
                          Date: {pool.startTime.split('T')[0]} <br /> ~ {pool.endTime.split('T')[0]}
                        </p>
                        <p className="text-body-secondary m-0">
                          {pool.donators.length} people donated
                        </p>
                      </div>
                      <div className='d-flex flex-column'>
                        {finish && (canWithdrawing(pool.currentPrice, pool.targetPrice) ? (
                          <CButton className="btn btn-danger mb-1 p-1" onClick={() => openModal(pool)}>
                            提款
                          </CButton>
                        ) : (
                          <CButton className="btn btn-warning mb-1 p-1">
                            募資失敗
                          </CButton>))}
                        {<Link
                          to={`/Pool/${pool._id}`}
                          className={`btn btn-${during ? 'success' : 'primary'} p-1`}
                        >
                          {during ? '募資中' : '檢視募資活動'}
                        </Link>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {pools.length === 0 && <h1 className='text-center my-3'>Pools not found</h1>}
      </div>
      <CButton className="more-activities">LOAD MORE</CButton>
    </div>
  )
}

export default MyPool