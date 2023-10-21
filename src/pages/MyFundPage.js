import React, { useState, useEffect } from 'react'
import { instance } from '../api'
import { useAddress, useContract } from '@thirdweb-dev/react'
import {
    CCardHeader,
    CButton,
    CCol,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CTooltip,
} from '@coreui/react'
import {Link} from 'react-router-dom'
import Spinner from '../components/Spinner'
import CIcon from '@coreui/icons-react'
import { cilLink } from '@coreui/icons'
const MyFund = () => {
    // const [keywords, setKeywords] = useState('')
    const [loading, setLoading] = useState(true)
    const [pools, setPools] = useState(null)
    const [contractAddress, setContractAddress] = useState('0xF5857Ef679be695c2dD22adC8D46ADdB41F6afa8');
    const address = useAddress()
    const [isModal, setIsModal] = useState(false)
    const [selectedPool, setSelectedPool] = useState(null)
    const { contract: pool_contract } = useContract(contractAddress); // Use the updated contractAddress
    const openModal = (pool) => {
        setSelectedPool(pool)
        // setContractAddress(pool.address)
        console.log(pool)
        setIsModal(true)
    }
    const closeModal = () => {
        setIsModal(false)
        setSelectedPool(null)
    }
    function parseKValue(value) {
        if (typeof value === 'string' && value.endsWith('k')) {
            return parseFloat(value.replace('k', '')) * 1000;
        }
        return parseFloat(value);
    }
    function getDonationAmountByAddress(pool, address) {
        // Find the donator by address in the pool's donators array
        console.log(pool)
        const donator = pool.donators.find(d => d.address === address);

        if (donator) {
            return donator.amount;
        } else {
            console.log(`No donation found for address ${address} in the provided pool.`);
            return 0; // or null, or any default value you prefer
        }
    }
    const percentage = (current, target) => {
        const currentPrice = parseKValue(current) || 0;
        const targetPrice = parseKValue(target) || 1;
        return Math.round((currentPrice / targetPrice) * 100)
    }
    useEffect(() => {
        // Check if pool has a value and pool.address is defined
        if (selectedPool && selectedPool.address) {
            setContractAddress(selectedPool.address);
        }
    }, [selectedPool]);
    // const searchPools = async (keywords) => { }
    // const handleEnter = async (e) => {
    //   if (e.key === 'Enter') {
    //     const filteredPools = await searchPools(keywords)
    //     setPools(filteredPools)
    //   }
    // }
    const getfundPools = async () => {
        instance.get('/pool/fund', { params: { address: address } })
            .then((res) => {
                console.log(res)
                setPools(res.data)
                setLoading(false)
            })
    }
    const redeem = async () => {
        await pool_contract.call("redeem")
        try {
            instance.post('/pool/redeem', { _id: selectedPool._id, donator: address }).then((res) => {
                alert(`已提領$${getDonationAmountByAddress(selectedPool, address)}USDT`)
            })
            //reload
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
        closeModal()
    }
    function getColorByPercentage(percentage) {
        if (percentage > 60) {
            return '#ff0000'; // red color for >60%
        } else if (percentage > 30) {
            return '#f5d742'; // Yellow color for >30% and <=60%
        } else {
            return 'green'; // Green color for <=30%
        }
    }
    useEffect(() => {
        if (address) getfundPools()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address])
    return (
        loading ? <Spinner /> : <div className="container">
            {selectedPool && (
                <CModal size="l" visible={isModal} onClose={closeModal} alignment="center" className='text-black'>
                    <CModalHeader onClose={closeModal} closeButton={false}>
                        <CModalTitle>Redeem</CModalTitle>
                    </CModalHeader>
                    <CModalBody className='d-flex justify-content-center'>
                        您即將停止募資 {selectedPool.title}<br />
                        提領募資金額 {getDonationAmountByAddress(selectedPool, address)} $USDT<br />
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={closeModal}>
                            回到上一頁
                        </CButton>
                        <CButton color="danger" onClick={redeem}>
                            Withdraw
                        </CButton>
                    </CModalFooter>
                </CModal>
            )}
            <div>
                <CCardHeader className="mb-1 border-0 text-center bg-transparent text-white">
                    <h1 className='my-4'><b><u>My Funds</u></b></h1>
                </CCardHeader>
                <div className="row w-100">
                    {pools.length === 0 ? <h1 className='text-center'>Pools not found</h1> : pools.map((pool, index) => {
                        const during = new Date() > new Date(pool.startTime) && new Date() < new Date(pool.endTime)
                        const isTarget = percentage(pool.currentPrice, pool.targetPrice) >= 100
                        return (
                            <div className="item-card" key={pool.id}>
                                <div className="card shadow-sm h-100">
                                    <img src={pool.image} alt="主視覺" className="card-img" height="250" />
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <div className="d-flex justify-content-between">
                                            <CCol xs={7} className='p-0' >
                                                <div className='d-flex align-items-center'>
                                                    <CTooltip content={pool.title}>
                                                        <h4>
                                                            {pool.title}
                                                        </h4>
                                                    </CTooltip>
                                                    <a href={`https://goerli.etherscan.io/address/${pool.address}`} target='_blank' rel="noopener noreferrer" className='ml-2'>
                                                        <CIcon icon={cilLink} size='lg' />
                                                    </a>
                                                </div>
                                                <p style={{
                                                    fontFamily: 'Arial, sans-serif',
                                                    fontSize: '16px',
                                                    color: '#ffffff',
                                                    /*bavkground yellow*/
                                                    backgroundColor: getColorByPercentage(percentage(pool.currentPrice, pool.targetPrice)),
                                                    padding: '5px 10px',
                                                    borderRadius: '10px',
                                                    display: 'inline-block',
                                                    margin: '5px 0',
                                                    textAlign: 'center'
                                                }}>
                                                    {percentage(pool.currentPrice, pool.targetPrice)}%
                                                </p>
                                            </CCol>
                                            <CCol xs={3} className='p-0'>
                                                <p className=' d-flex flex-column align-items-end justify-content-end'>
                                                    <span>捐贈金額<br />{getDonationAmountByAddress(pool, address)}USDT</span>
                                                </p>
                                            </CCol>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-end">
                                            <div>
                                                <p className="text-body-secondary m-0">
                                                    {pool.donators.length} <CIcon icon='cil-user' className='text-black' height='17' /> donated
                                                </p>
                                                <p className="text-body-secondary m-0">
                                                    {pool.startTime.split('T')[0]} ~ {pool.endTime.split('T')[0]}
                                                </p>
                                            </div>
                                            <div className='d-flex flex-column'>
                                                {during ? (
                                                    <a
                                                        href={`/Pool/${pool._id}`}
                                                        className='btn btn-success p-1'
                                                    >
                                                        募資中
                                                    </a>
                                                ) : (
                                                    (isTarget ? <Link
                                                        to={`/Pool/${pool._id}`}
                                                        className='btn btn-primary p-1'
                                                    >
                                                        檢視活動
                                                    </Link> :
                                                        <button key={pool._id} className='btn btn-success' onClick={() => {
                                                            openModal(pool)
                                                        }}>
                                                            <nobr>提領金額</nobr>
                                                        </button>
                                                    )
                                                )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default MyFund