import React from 'react'

const AddCircle = ({url}) => {
  return (
    <a href={url} className="text-decoration-none d-flex align-items-center justify-content-center">
        <div className="text-white border border-5 border-white rounded-circle p-5 d-flex justify-content-center align-items-center" style={{width:'45vh', height:'45vh'}}>
            <b style={{fontSize:'16rem'}}>+</b>
        </div>
    </a>
  )
}

export default AddCircle