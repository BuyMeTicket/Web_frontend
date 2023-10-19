import React, { useState } from 'react'
import { CInputGroup, CFormInput } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useLocation } from 'react-router-dom'
import { instance } from '../api'

const Searchbar = ({ setFunc }) => {
    const location = useLocation()
    const pathname = location.pathname
    const [keywords, setKeywords] = useState('')
    const search = async (keywords) => {
        const page = pathname.includes('activities') ? 'activity' : pathname.includes('tickets') ? 'ticket' : pathname.includes('pool') ? 'pool' : ''
        instance.get(`/${page}/search`, { params: { keywords, page: 1, perpage: 9 } }).then((res) => {
            setFunc(res.data)
        })
    }
    const handleEnter = async (e) => {
        if (e.key === 'Enter') {
            search(keywords)
        }
    }
    return (
        <CInputGroup className='d-flex justify-content-center'>
            <CFormInput
                style={{ borderRadius: '2.5rem', backgroundColor: 'gray', border: 'none', maxWidth: '20rem', marginBottom: '-1rem' }}
                type="search"
                placeholder="Searching..."
                onChange={(e) => {
                    setKeywords(e.target.value)
                }}
                onKeyPress={handleEnter}
            />
            <CIcon icon='cil-zoom' className='text-white mt-1' style={{ marginLeft: '-2.5rem', zIndex: 1 }} height='30' />
        </CInputGroup>
    )
}

export default Searchbar