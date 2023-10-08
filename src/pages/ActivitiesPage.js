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
  CInputGroup,
  CFormInput,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLink } from '@coreui/icons'
import Spinner from '../components/Spinner';
import AddCircle from '../components/AddCircle';

const Activities = () => {
  const address = useAddress()
  const [loading, setLoading] = useState(true)
  const { contract: GlobalContract } = useContract(GLOBAL_ADDRESS);
  const {
    data: isEventHolder,
  } = useContractRead(GlobalContract, "isEventHolders", [address])
  const [keywords, setKeywords] = useState('')
  const [activities, setActivities] = useState(null)
  let popularActivities = activities ? activities.slice() : null
  popularActivities = activities ? popularActivities.sort((a, b) => b.watches - a.watches).slice(0, 3) : null

  const getActivities = async () => {
    instance.get('/activity/all').then((res) => {
      setActivities(res.data)
      setLoading(false)
    })
  }

  const searchActivities = async (keywords) => { }
  const handleEnter = async (e) => {
    if (e.key === 'Enter') {
      const filteredActivities = await searchActivities(keywords)
      setActivities(filteredActivities)
    }
  }
  useEffect(() => {
    getActivities()
  }, [])
  return (
    activities === null ? <Spinner /> : <div className="container d-flex flex-column justify-content-center align-items-center">
      <CInputGroup className='d-flex justify-content-center'>
        <CFormInput
          style={{ borderRadius: '2.5rem', backgroundColor: 'gray', border: 'none', maxWidth: '20rem', marginBottom: '-1rem' }}
          type="search"
          placeholder="Search for Activity"
          onChange={(e) => {
            setKeywords(e.target.value)
          }}
          onKeyPress={handleEnter}
        />
        <CIcon icon='cil-zoom' className='text-white mt-1' style={{ marginLeft: '-2.5rem', zIndex: 1 }} height='30' />
      </CInputGroup>
      <CRow className="d-block justify-content-center my-4">
        <CCard className="bg-transparent border-0">
          <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
            <h1><b><u>Popular Events</u></b></h1>
          </CCardHeader>
          <CCardBody style={{ maxWidth: '50rem' }}>
            <CCarousel controls indicators transition="crossfade">
              {activities.length === 0 ? <h1 className='text-center'>Activities not found</h1> : popularActivities.map((popAct, index) => {
                return (
                  <CCarouselItem key={index}>
                    <Link to={`/activity/${popAct._id}`}>
                      <CImage
                        className="d-block"
                        fluid
                        style={{ height: '30rem' }}
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
      </CRow>
      <div>
        <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
          <h1 className='my-4'><b><u>All Events</u></b></h1>
        </CCardHeader>
        <div className="d-flex flex-wrap justify-content-center" style={{ gap: '1.3rem' }}>
          {isEventHolder && <AddCircle url='/activity/Add' />}
          {activities.length === 0 ? <h1 className='text-center'>Activities not found</h1> : activities.map(activity => {
            return (
              <div className='item-card' key={activity._id}>
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
                          {activity.startSelling && <span>剩餘/總票數:<br />{activity.leftTickets}/{activity.totalTickets}</span>}
                        </p>
                        {/* <p className="text-body-secondary m-0">
                        {activity.date.split('T')[0]}
                      </p> */}
                        <Link
                          to={`/activity/${activity._id}`}
                          className={`btn btn-${activity.startSelling ? 'success' : 'primary'}`}
                        >
                          {activity.startSelling ? '開賣中' : '檢視活動'}
                        </Link>
                      </CCol>
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

export default Activities