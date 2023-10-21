import React from 'react'
import { Link } from 'react-router-dom'
const AddCircle = ({url}) => {
  return (
    <Link to={url} className="text-decoration-none d-flex align-items-center justify-content-center">
        <div className="text-white border border-5 border-white p-5 d-flex justify-content-center align-items-center item-card">
            <b style={{fontSize:'16rem'}}>+</b>
        </div>
    </Link>
  )
}

export default AddCircle