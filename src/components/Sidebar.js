import React, { useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    CSidebarBrand,
    CSidebarNav,
    CHeaderNav,
    CNavLink,
    CImage
} from '@coreui/react'
import logo from '../assets/images/logo.png'
import { NavLink } from 'react-router-dom'
import SimpleBar from 'simplebar-react'
import { selectGlobal, sidebarHide } from '../slices/globalSlice'

function useOutsideAlerter(ref, eventHandler) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
            eventHandler()
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
const Sidebar = () => {
    const dispatch = useDispatch()
    const { sidebarShow } = useSelector(selectGlobal)
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => dispatch(sidebarHide()));
    const navs = [{ text: "Activities", link: "/activities" }, { text: "Pool", link: "/pools" }, { text: "Leaderboard", link: "/leaderboard" }]
  return (
    <div className={`sidebar ${sidebarShow ? "sidebar-show":"d-none"} h-100`} style={{position:"fixed", zIndex:2000}} ref={wrapperRef}>
        <CSidebarBrand className="bg-none" to="/">
          <CImage className="d-lg-none d-flex pt-1 bg-none text-dark" src={logo} width="50%" />
        </CSidebarBrand>
        <CSidebarNav className="bg-dark">
          <SimpleBar>
          {navs.map(nav => (
              <CHeaderNav className="d-flex align-items-center">
                <CNavLink to={nav.link} component={NavLink}>
                  <h4 className='text-white my-0 mx-3'>{nav.text}</h4>
                </CNavLink>
              </CHeaderNav>
            ))}
          </SimpleBar>
        </CSidebarNav>
    </div>
  )
}

export default Sidebar