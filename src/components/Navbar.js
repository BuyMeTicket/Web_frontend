import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CNavLink,
  CNavItem,
  CImage,
  CHeaderToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import logo from '../assets/images/logo.png'
import { NavLink } from 'react-router-dom'
import { selectGlobal, sidebarOpen, sidebarHide } from '../slices/globalSlice'
import HeaderDropdown from './HeaderDropdown'

const Navbar = () => {
  const address = useAddress()
  const dispatch = useDispatch()
  const { sidebarShow } = useSelector(selectGlobal)
  const navs = [{ text: "Activities", link: "/activities" }, { text: "Pool", link: "/pools" }, { text: "Leaderboard", link: "/leaderboard" }]
  return (
    <>
      <CHeader position="sticky" className="mb-4 bg-black text-white">
        <CContainer className="d-flex flex-between" fluid>
          <CHeaderToggler
            className="ms-md-3 d-xl-none text-white"
            onClick={() => {
              sidebarShow ? dispatch(sidebarHide()) : dispatch(sidebarOpen())
            }}
          >
            <CIcon icon='cil-hamburger-menu' className='text-white' height='30' />
          </CHeaderToggler>
          <CHeaderNav className="d-flex justify-content-center align-items-center col-2 text-white d-xl-block d-none">
            <CNavLink to="/" component={NavLink} className="d-flex align-items-center">
              <CImage src={logo} fluid /> <h2 className="m-0 text-center text-white">BuyMeTicket</h2>
            </CNavLink>
          </CHeaderNav>
          <div className="d-flex flex-around justify-content-end col-9">
            {navs.map(nav => (
              <CNavItem className="d-xl-block d-none">
                <CHeaderNav className="d-flex align-items-center">
                  <CNavLink to={nav.link} component={NavLink}>
                    <h4 className='text-white my-0 mx-3'>{nav.text}</h4>
                  </CNavLink>
                </CHeaderNav>
              </CNavItem>
            ))}
            <div className="connect">
              <ConnectWallet
                dropdownPosition={{
                  side: "bottom",
                  align: "center",
                }}
                />
            </div>
            {address &&
              <CHeaderNav className="ms-3 d-block">
                <HeaderDropdown />
              </CHeaderNav>}
          </div>
        </CContainer>
      </CHeader>
    </>
  )
}

export default Navbar