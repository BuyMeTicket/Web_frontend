import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { GLOBAL_ADDRESS } from "../const/contractAddress";
import { instance } from '../api'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCarousel,
  CCarouselCaption,
  CCarouselItem,
  CImage,
  CRow,
  CButton,
  CTooltip,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLink } from '@coreui/icons'
import Spinner from '../components/Spinner';
import AddCircle from '../components/AddCircle';
import Searchbar from '../components/Searchbar';

const Pools = () => {
  const address = useAddress()
  const { contract: GlobalContract } = useContract(GLOBAL_ADDRESS);
  const {
    data: isEventHolder,
  } = useContractRead(GlobalContract, "isEventHolders", [address])
  const [loading, setLoading] = useState(true)
  const [pools, setPools] = useState(null)
  const [popularPools, setPopularPools] = useState(null)
  const getPools = async () => {
    instance.get('/pool/all').then((res) => {
      setPools(res.data)
      if (res.data.length < 3) setPopularPools(res.data)
      else setPopularPools(res.data.slice(0, 3))
      setLoading(false)
    })
  }


  useEffect(() => {
    getPools()
  }, [])
  return (
    popularPools === null ? <Spinner /> : <div className="container d-flex flex-column justify-content-center align-items-center">
      <Searchbar setFunc={setPools} />
      <CRow className="d-block justify-content-center my-4">
        <CCard className="bg-transparent border-0">
          <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
            <h1><b><u>Popular Pools</u></b></h1>
          </CCardHeader>
          <CCardBody style={{ maxWidth: '50rem' }}>
            <CCarousel controls indicators transition="crossfade">
              {loading ? <Spinner /> : popularPools.map((popPool, index) => {
                return (
                  <CCarouselItem key={index}>
                    <Link to={`/pool/${popPool._id}`}>
                      <CImage
                        className="d-block"
                        fluid
                        style={{ height: '30rem' }}
                        src={popPool.image}
                        alt={popPool._id}
                      />
                      <CCarouselCaption className="d-none d-md-block">
                        <h3>{popPool.title}</h3>
                      </CCarouselCaption>
                    </Link>
                  </CCarouselItem>
                )
              })}
            </CCarousel>
          </CCardBody>
        </CCard>
      </CRow>
      <div>
        <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
          <h1 className='my-4'><b><u>All Pools</u></b></h1>
        </CCardHeader>
        <div className="d-flex flex-wrap" style={{ gap: '1.3rem' }}>
          {isEventHolder && <AddCircle url={'/pool/Add'} />}
          {loading ? <h1 className='text-center'>Pools not found</h1> : pools.map((pool, index) => {
            return (
              <div className='item-card' key={pool._id}>
                <div className="card shadow-sm h-100">
                  <img src={pool.image} alt="主視覺" className="card-img" height="250" />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between">
                      <CCol xs={7} className='p-0' >
                        <div className="d-flex align-items-center">
                          <CTooltip content={pool.title}>
                            <h4>
                              {pool.title}
                            </h4>
                          </CTooltip>
                          <a href={`https://goerli.etherscan.io/address/${pool.address}`} target='_blank' rel="noopener noreferrer" className='ml-2 mb-1'>
                            <CIcon icon={cilLink} size='lg' />
                          </a>
                        </div>
                      </CCol>
                      <CCol xs={4} className='p-0'>
                        <p className=' d-flex flex-column align-items-end justify-content-end'>
                          <span className='mb-1'>
                            {pool.watches} <CIcon icon='cil-user' />
                          </span>
                          {<span>已募得/目標:<br /> <nobr>${pool.currentPrice}/{pool.targetPrice} USDT</nobr></span>}
                        </p>
                      </CCol>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="text-body-secondary m-0">
                        {pool.startTime.split('T')[0]} ~ {pool.endTime.split('T')[0]}
                      </p>
                      <Link
                        to={`/pool/${pool._id}`}
                        className={`btn btn-${pool.startSelling ? 'success' : 'primary'}`}
                      >
                        {pool.startSelling ? '募資中' : '檢視募資活動'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <CButton className="more-pools">LOAD MORE</CButton>
    </div>
  )
}

export default Pools