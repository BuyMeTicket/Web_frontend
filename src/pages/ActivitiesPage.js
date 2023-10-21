import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAddress, useContractRead, useContract } from "@thirdweb-dev/react";
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
const Activities = () => {
  const address = useAddress()
  const [loading, setLoading] = useState(true)
  const { contract: GlobalContract } = useContract(GLOBAL_ADDRESS);
  const {
    data: isEventHolder,
  } = useContractRead(GlobalContract, "isEventHolders", [address])
  const [activities, setActivities] = useState(null)
  const [popularActivities, setPopularActivities] = useState(null)
  const getActivities = async () => {
    instance.get('/activity/all').then((res) => {
      setActivities(res.data)
      if(res.data.length <3) setPopularActivities(res.data)
      else setPopularActivities(res.data.slice(0, 3))
      setLoading(false)
    })
  }


  useEffect(() => {
    getActivities()
  }, [])
  return (
    loading ? <Spinner /> :
      <div className="container d-flex flex-column justify-content-center align-items-center">
        <Searchbar setFunc={setActivities} />
        {popularActivities.length!==0&&<CRow className="d-block justify-content-center my-4">
          <CCard className="bg-transparent border-0">
            <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
              <h1><b><u>Popular Events</u></b></h1>
            </CCardHeader>
            <CCardBody style={{ maxWidth: '50rem' }}>
              <CCarousel controls indicators transition="crossfade" className='h-100'>
                {activities.length === 0 ? <h1 className='text-center'>Activities not found</h1> : popularActivities.map((popAct, index) => {
                  return (
                    <CCarouselItem key={index}>
                      <Link to={`/activity/${popAct._id}`}>
                        <CImage
                          className="d-block image-fluid"
                          fluid
                          src={popAct.image}
                          alt={popAct.id}
                        />
                        <CCarouselCaption className="d-none d-md-block">
                          <h3>{popAct.title}</h3>
                        </CCarouselCaption>
                      </Link>
                    </CCarouselItem>
                  )
                })}
              </CCarousel>
            </CCardBody>
          </CCard>
        </CRow>}
        <div>
          <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
            <h1 className='my-4'><b><u>All Events</u></b></h1>
          </CCardHeader>
          <div className="d-flex flex-wrap" style={{ gap: '1.3rem' }}>
            {isEventHolder && <AddCircle url='/activity/Add' />}
            {activities.length !== 0 && activities.map(activity => {
              return (
                <div className='item-card' key={activity._id}>
                  <div className="card shadow-sm h-100">
                    <img src={activity.image} alt="主視覺" className="card-img" height="250" />
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div className="d-flex justify-content-between">
                        <CCol xs={7} className='p-0' >
                          <div className='d-flex align-items-center'>
                            <CTooltip content={activity.title}>
                              <h4>
                                {activity.title}
                                <>{' '}</>
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
                            {activity.startSelling && <span>剩餘/總票數:<br />{activity.leftTickets}/{activity.totalTickets}</span>}
                          </p>
                          {/* <p className="text-body-secondary m-0">
                        {activity.date.split('T')[0]}
                      </p> */}
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
                        <Link
                          to={`/activity/${activity._id}`}
                          className={`btn btn-${activity.startSelling ? 'success' : 'primary'}`}
                        >
                          {activity.startSelling ? '開賣中' : '檢視活動'}
                        </Link>
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

export default Activities