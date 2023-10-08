import React from 'react'
import { CCol, CFooter } from '@coreui/react'
import logo from '../assets/images/logo.png'
import CIcon from '@coreui/icons-react'

const Footer = () => {
  return (
    <>
      <CFooter
        style={{
          backgroundColor: '#000',
          borderColor: 'transparent',
          color: 'white',
        }}
      >
        <CCol sm={12} md={3} className='d-flex align-items-center'>
          <img src={logo} alt="logo" className="img-fluid" />
          <div>
            <h3><b>BuyMeTicket</b></h3>
            <h5 className='m-0'><b>The New Ticket Solution</b></h5>
          </div>

        </CCol>
        <CCol sm={12} md={1} className='my-2'> </CCol>
        <CCol sm={12} md={8}>
            <div className="row">
                <CCol md={1}></CCol>
                <CCol sm={12} md={8}>
                    <h4 className='text-center d-flex justify-content-around'><b>Investor</b> <b>Term</b> <b>Privacy</b> <b>FAQ</b></h4>
                </CCol>
                <CCol sm={12} md={3}>
                  <div className="d-flex justify-content-around">
                    <CIcon icon="cib-gmail" size='xxl' className='d-none d-lg-block' />
                    <CIcon icon="cib-facebook" size='xxl' className='d-none d-lg-block' />
                    <CIcon icon="cib-twitter" size='xxl' className='d-none d-lg-block' />
                    <CIcon icon="cib-gmail" size='xl' className='d-lg-none d-block mt-2' />
                    <CIcon icon="cib-facebook" size='xl' className='d-lg-none d-block mt-2' />
                    <CIcon icon="cib-twitter" size='xl' className='d-lg-none d-block mt-2' />
                  </div>
                </CCol>
            </div>
        </CCol>
      </CFooter>
      <CFooter
        className="justify-content-center p-0"
        style={{
          height: '1rem',
          backgroundColor: '#000',
          borderColor: 'transparent',
          color: 'white',
        }}
      >
        Copyright @2023 BuyMeTicket. All rights reserved.
      </CFooter>
    </>
  )
}

export default Footer