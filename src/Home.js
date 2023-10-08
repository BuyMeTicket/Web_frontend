import React, { useState, useEffect } from 'react';
import { instance } from './api';
import logo from './assets/images/logo.png';
import NFT_SHORT1 from './assets/images/NFT-SHORT 1.png';
import NFT_SHORT2 from './assets/images/NFT-SHORT 2.png';
import { Link } from 'react-router-dom'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCarousel,
    CCarouselCaption,
    CCarouselItem,
    CImage,
    CRow,
} from '@coreui/react'

export default function Home() {
    const [activities, setActivities] = useState([])
    const [popularActivities, setPopularActivities] = useState([])
    const getActivities = async () => {
        instance.get('/activity/all').then((res) => {
            setActivities(res.data)
            setPopularActivities(res.data.sort((a, b) => b.watches - a.watches).slice(0, 3))
        })
    }
    useEffect(() => {
        getActivities()
    }, [])
    return (
        <div className="container text-white px-0">
            {activities.length>0&&<div className="border-bottom pb-3 mb-5 d-flex flex-column justify-content-center align-items-center">
                <CRow className="d-block justify-content-center my-4">
                    <CCard className="bg-transparent border-0">
                    <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
                        <h1><b><u>Popular Events</u></b></h1>
                    </CCardHeader>
                    <CCardBody style={{maxWidth:'50rem'}}>
                        <CCarousel controls indicators transition="crossfade">
                        {popularActivities.map((popAct, index) => {
                            return (
                            <CCarouselItem key={index}>
                                <Link to={`/activity/${popAct._id}`}>
                                <CImage
                                    className="d-block"
                                    fluid
                                    style={{height:'30rem'}}
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
                    <h1><b><u>All Events</u></b></h1>
                    </CCardHeader>
                    {activities.map((index) => {
                        if(index%4===0){
                            const acts = activities.slice(index, index+4)
                            return(
                                <>
                                <div className="row w-100 justify-content-around align-items-end mt-5 gallery-row">
                                    {acts.map((act, index) => {
                                        return (
                                            <div key={index} className="col-3">
                                                <Link to={`/activity/${act._id}`}>
                                                    <CImage
                                                    className="d-block"
                                                    width="280rem"
                                                    style={{borderRadius:'1rem', overflow:'clip', maxHeight:'15rem',boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)"}}
                                                    fluid
                                                    src={act.image}
                                                    alt={act.id}
                                                    />
                                                </Link>
                                                <CCardHeader className="text-center text-black my-1">
                                                <h5><nobr>{act.title}</nobr></h5>
                                                </CCardHeader>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="shell">{' '}</div>
                                </>
                            )
                        }else{
                            return null
                        }
                    })}
                </div>
                <Link className="more-activities text-decoration-none" to='/activities'>EXPLORE MORE</Link>
            </div>}
            <div className='border-bottom pb-3 mb-5'>
                <h1 className="d-flex justify-content-center align-items-center">
                    <img src={logo} alt="logo" className="mx-4" />
                    <b>Why BuyMeTicket?</b>
                    <br/>
                </h1>
                <p className="text-center fs-4">
                    A brand-new ticket solution on chain, including auto-generated Smart Contract, NFT airdrop and Decentralized Funding Pool, to maximize your events!
                </p>
                <br/>
                <div className='row d-flex justify-content-around mb-5'>
                        <h3 className='col-3 d-flex flex-column align-items-center justify-content-center px-5 py-4 border border-3 border-white'>Interactivity</h3>
                        <h3 className='col-3 d-flex flex-column align-items-center justify-content-center px-5 py-4 border border-3 border-white'>Privacy</h3>
                        <h3 className='col-3 d-flex flex-column align-items-center justify-content-center px-5 py-4 border border-3 border-white'>Security</h3>
                </div>
            </div>
            <div className='border-bottom pb-3 mb-5'>
                <div className="row mb-5">
                    <div className="col-5">
                        <img src={NFT_SHORT1} alt="NFT_SHORT1" className="img-fluid w-100"/>
                    </div>
                    <div className="col-7">
                        <h1 className="d-flex justify-content-start align-items-center">
                            <b>NFT As Ticket</b>
                        </h1>
                        <h2 className="d-flex justify-content-start align-items-center">
                            <b>The most special ticket for the best event</b>
                            <br/>
                        </h2>
                        <br/>
                        <p className="text-center fs-4">
                            Your event ticket will be stored on blockchain as NFT. When register for the event, participants will receive the respective NFT. 
                        </p>
                        <img src={logo} alt="logo" style={{marginLeft:'-5rem', width:'9rem'}} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-7 d-flex flex-column justify-content-start align-items-end">
                        <h1>
                            <b>A More Diverse Operability</b>
                        </h1>
                        <h2>
                            <b>Enable more interaction with attendees</b>
                            <br/>
                        </h2>
                        <br/>
                        <p className="text-end fs-4 w-75">
                            The host can have white list, execute air drop before the event, and keep the connection with the participants after the event. 
                        </p>
                        <img src={logo} alt="logo" style={{marginRight:'-5rem', width:'9rem', zIndex:1}} />
                    </div>
                    <div className="col-5">
                        <img src={NFT_SHORT2} alt="NFT_SHORT2" className="img-fluid w-100"/>
                    </div>
                </div>
            </div>
            <div className='d-flex flex-column justify-content-center align-items-center pb-3 mb-5'>
                <h1><b>Re-imagine Ticket, Re-form Customer Experience</b></h1>
                <br/>
                <h3>讓 BuyMeTicket 解決方案加速你的商業</h3>
                <br/>
                <button style={{borderRadius:'3rem', width:'25rem'}} className="bg-white text-black px-4 py-3"><h3 className="m-0 text-center"><b>聯絡我們</b></h3></button>
            </div>
        </div>
    );
}