/*global ethereum*/
import React, { useState, useEffect } from 'react';
import { backend_uri } from '../api';
import * as Passwordless from "@passwordlessdev/passwordless-client";
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
    CFormSelect,
    CCol,
    CTooltip,
} from '@coreui/react'
import Swal from 'sweetalert2';
import { QRCodeCanvas } from "qrcode.react";
import { useAddress, useContract, Web3Button } from "@thirdweb-dev/react";
import { TICKET_FACTORY_ADDRESS } from '../const/contractAddress';
import { instance } from '../api';
import { API_KEY } from '../const/backend';
import Spinner from '../components/Spinner';
import CountdownTimer from '../components/countdownTimer';
let expireTimeout = null;
function MyTicketPage() {
    const [isModal, setIsModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [selection, setSelection] = useState('available');
    const { contract: Ticket_Factory_Contract } = useContract(TICKET_FACTORY_ADDRESS);
    const [alltickets, setAllTickets] = useState(null);
    const [showTickets, setShowTickets] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState('')
    const [qrCodeValue, setQrCodeValue] = useState(selectedTicket ? selectedTicket.encryptedValue : '');
    const address = useAddress();
    const deleteTicket = async (ticket) => {
        console.log(ticket)
        instance.delete('/ticket/delete', {params:{ _id: ticket}})
    }
    const closeModal = () => {
        setIsModal(false)
        setSelectedTicket(null)
    }
    const getOwnTickets = async () => {
        instance.get('/ticket/own', { params: { owner: address } })
            .then(res => {
                setShowTickets(res.data.filter((ticket) => {
                    return ticket.status === selection;
                }));
                setAllTickets(res.data)
                setLoading(false)
            })
    }
    const handleSelectedTicket = async (ticket) => {
        const encrypted = await encrypt(ticket);
        const encryptedData = address + '/' + encrypted;
        setQrCodeValue(encryptedData);
        setSelectedTicket(ticket)
    }
    const verifySignin = async () => {
        const alias = address;
        const p = new Passwordless.Client({
            apiKey: API_KEY,
        });
        const { token, error } = await p.signinWithAlias(alias);
        if (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Sign in failed, received the error',
            })
            return;
        }
        try {
            const response = await backend_uri.get("/verify-signin", {
                params: {
                    token: token
                }
            });
            const user = response.data;
            if (user.success === true) {
                Swal.fire({
                    icon: 'success',
                    title: 'Show QR code success!!',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                timer: 1500
            })
        }
    }
    const showTicket = async (ticket) => {
        await verifySignin();
        await handleSelectedTicket(ticket);
        setIsModal(true)
        // Clear any existing timeout
        if (expireTimeout) {
            clearTimeout(expireTimeout);
        }
        // Set a new timeout to call the deleteQRCode function after 5 minutes
        expireTimeout = setTimeout(() => {
            instance.post('/user/expire', { address })
        }, 10000);  // 30 second in milliseconds
    }
    const addMetaMask = async (ticket) => {
        try {
            for (let tikki in ticket.activity.tickets) {
                if (ticket.activity.tickets[tikki].name === ticket.name) {
                    const wasAdded = await ethereum.request({
                        method: 'wallet_watchAsset',
                        params: {
                            type: 'ERC1155',
                            options: {
                                address: ticket.activity.eventAddress, // The address of the token.
                                tokenId: tikki, // ERC-721 or ERC-1155 token ID.
                                symbol: ticket.activity.title,
                            },
                        },
                    });
                    if (wasAdded) {
                        console.log('User successfully added the token!');
                    } else {
                        console.log('User did not add the token.');
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    const encrypt = async (ticket) => {
        const data = ticket.activity._id + '/' + ticket.owner + '/' + ticket.name + '/' + ticket.quantity
        console.log(data)
        try {
            const response = await instance.post('/crypto/encrypt', { data, address });
            console.log(response.data);
            return response.data;
        } catch (err) {
            console.log(err);
            throw err; // or handle the error as needed
        }
    }
    useEffect(() => {
        if (address) getOwnTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);
    useEffect(() => {
        alltickets &&
            setShowTickets(alltickets.filter((ticket) => {
                return ticket.status === selection;
            }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection]);
    const RefreshQRCode = async () => {
        try {
            // Logic to refresh the QR code
            const encrypted = await encrypt(selectedTicket);
            const encryptedData = address + '/' + encrypted;
            setQrCodeValue(encryptedData);
            console.log('QR code refreshed!');
            // Clear any existing timeout
            if (expireTimeout) {
                clearTimeout(expireTimeout);
            }
            // Set a new timeout to call the deleteQRCode function after 5 minutes
            expireTimeout = setTimeout(() => {
                instance.post('/user/expire', { address })
            }, 10000);  // 30 second in milliseconds
        } catch (error) {
            console.error("Error refreshing QR code:", error);
        }
    };
    return (
        loading ? <Spinner /> : <div className="container">
            {selectedTicket && (
                <CModal size="l" visible={isModal} onClose={closeModal} alignment="center" className='text-black'>
                    <CModalHeader onClose={closeModal} closeButton={false}>
                        <CModalTitle>{selectedTicket.name}</CModalTitle>
                    </CModalHeader>
                    <CModalBody className='d-flex justify-content-center'>
                        <QRCodeCanvas
                            id="qrCode"
                            value={qrCodeValue}
                            margin={'20px'}
                        />
                    </CModalBody>
                    <CModalFooter>
                        <CountdownTimer RefreshQRCode={RefreshQRCode} />
                        <CButton
                            color="success"
                            onClick={closeModal}
                        >
                            OK
                        </CButton>
                    </CModalFooter>
                </CModal>
            )}
            <h1 className='text-center'>NFT Gallery</h1>
            <CFormSelect className="mx-auto my-3 w-25" value={selection} onChange={(e) => setSelection(e.target.value)}>
                <option value="available">未使用</option>
                <option value="used">已使用</option>
                <option value="others">其他</option>
            </CFormSelect>
            <div className="container d-flex flex-column justify-content-center align-items-center">
                <div className="d-flex flex-wrap" style={{ gap: '1.3rem' }}>
                    {showTickets.length === 0 ? <h1 className='text-center'>Tickets not found</h1> : showTickets.map((ticket, index) => {
                        const endTime = ticket.activity.endSellTime
                        const daySeconds = 24 * 60 * 60 * 1000
                        const timeDifference = Date.now() - new Date(endTime)
                        const canRefund = timeDifference < -4 * daySeconds;
                        const dayStep = [20, 15, 12, 10, 8, 6, 4]
                        const rate = 90 - 15 * dayStep.findIndex((day) => {
                            return timeDifference < -day * daySeconds
                        })
                        return (
                            <div className='item-card' key={ticket._id}>
                                <div className="card shadow-sm h-100">
                                    <img src={ticket && ticket.nft} alt='票券nft' className="card-img" height="250" />
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <div className='row'>
                                            <div className="d-flex align-items-center">
                                                <CTooltip content={ticket.activity.title} placement="bottom">
                                                    <h4 className='m-0'>
                                                        <b>{ticket.activity.title} </b>
                                                    </h4>
                                                </CTooltip>
                                                <CTooltip content="Add transaction info to MetaMask" placement="right">
                                                    <CButton className='btn-warning' onClick={() => addMetaMask(ticket)}>
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask Icon" width="25" height="25" />
                                                    </CButton>
                                                </CTooltip>
                                            </div>
                                            <small className="text-body-secondary m-0" >{ticket.name} x {ticket.quantity}</small>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <CCol xs={7} className='d-flex flex-column justify-content-center pl-0'>
                                                {canRefund && <p className="text-body-secondary m-0">
                                                    Refund Rate : {rate}%
                                                </p>}
                                                <p className="text-body-secondary m-0">
                                                    Date : {ticket.activity.date.split('T')[0]}
                                                </p>
                                            </CCol>
                                            <CCol xs={5} className='d-flex flex-column justify-content-center align-items-center'>
                                                {(ticket.status === 'available' && canRefund) ? (
                                                    <Web3Button
                                                        contractAddress={TICKET_FACTORY_ADDRESS}
                                                        action={async () => {
                                                            await Ticket_Factory_Contract.call("refundEventTicket", [ticket.activity.eventId, ticket.name, ticket.quantity]);
                                                            if (ticket._id === null) return;
                                                            deleteTicket(ticket._id)
                                                            setIsModal(false)
                                                        }}
                                                        onSuccess={() => {
                                                            Swal.fire({
                                                                icon: 'success',
                                                                title: 'NFT has been successfully refunded',
                                                                showConfirmButton: false,
                                                                timer: 1500
                                                            })
                                                        }}
                                                        onError={() => {
                                                            Swal.fire({
                                                                icon: 'error',
                                                                title: 'Refund failed',
                                                            })
                                                            setIsModal(false)
                                                        }}
                                                    >
                                                        Refund
                                                    </Web3Button>
                                                ) : (ticket.status === 'available' &&
                                                    <div>
                                                        <button key={ticket._id} className={`btn btn-${'success'}`} onClick={() => showTicket(ticket)}>
                                                            <nobr>使用票券</nobr>
                                                        </button>
                                                    </div>
                                                )}
                                            </CCol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default MyTicketPage;