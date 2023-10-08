import React, { useState, useEffect } from 'react'
import { useParams,useNavigate } from 'react-router-dom'
import { instance } from '../api'
import CIcon from '@coreui/icons-react'
import { cilLink } from '@coreui/icons'
import {
  CModal,
  CModalBody,
  CModalFooter,
  CButton,
} from '@coreui/react'
import { USDT_ADDRESS } from '../const/contractAddress'
import { useAddress, useContract, useContractRead } from '@thirdweb-dev/react'

const PoolPage = () => {
  const navigate = useNavigate();
  const { id } = useParams()
  const donator = useAddress()
  const [pool, setPool] = useState(null)
  const [isModal, setIsModal] = useState(false)
  const [amount, setAmount] = useState(0)
  const [contractAddress, setContractAddress] = useState('0xF5857Ef679be695c2dD22adC8D46ADdB41F6afa8');
  const getPool = async () => {
    try {
      instance.get('/pool', { params: { _id: id } }).then((res) => {
        setPool(res.data)
      })
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    // Check if pool has a value and pool.address is defined
    if (pool && pool.address) {
      setContractAddress(pool.address);
    }
  }, [pool]);
  const { contract: usdt_contract } = useContract(USDT_ADDRESS); // Use the updated contractAddress
  const { contract: pool_contract } = useContract(contractAddress); // Use the updated contractAddress
  const { data: totalDepositedAmount } = useContractRead(pool_contract, "totalDepositedAmount");
  console.log(totalDepositedAmount)
  const Donate = async (e) => {
    e.preventDefault();
    console.log(pool.address)
    // Assuming you have a web3 instance and a contract instance already set up
    await usdt_contract.call("approve", [pool.address, Number(amount * 10000)])
    await pool_contract.call("deposit", [Number(amount * 10000)])
    try {
      instance.post('/pool/donate', { _id: id, amount: Number(amount), donator }).then((res) => {
        alert(`已捐出$${amount}USDT`)
        navigate('/pool/' + id)
      })
    } catch (error) {
      console.log(error)
    }
  }
  // const openModal = () => {
  //   setIsModal(true)
  // }
  const validsellTime = () => {
    const now = new Date()
    const start = new Date(pool.startTime)
    const end = new Date(pool.endTime)
    if (now > start && now < end) {
      return true
    }
    return false
  }
  const closeModal = () => {
    setIsModal(false)
  }
  useEffect(() => {
    getPool()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      <CModal size="lg" visible={isModal} onDismiss={closeModal} alignment="center" className='text-black'>
        <CModalBody>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={closeModal}
          >
            取消
          </CButton>
        </CModalFooter>
      </CModal>
      {pool && <div className='container card p-4 w-75'>
        <div className='d-flex justify-content-center align-items-center'>
          <img src={pool.image} alt="主視覺" className="img-fluid" width='auto' style={{ maxHeight: '40rem' }} />
        </div>
        <div className='row mx-5 py-4'>
          <h2>
            {pool.title}
            <>{' '}</>
            <a href={`https://goerli.etherscan.io/address/${pool.address}`} target='_blank' rel="noopener noreferrer">
              <CIcon icon={cilLink} size='lg' />
            </a>
          </h2>
        </div>
        <div className='row mx-5 '>
          <h4><b>募資活動介紹：</b></h4>
          <h5>{pool.description}</h5>
        </div>
        <div className='row mx-5 py-3'>
          <h4><b>購買注意事項：</b></h4>
          <p>
            穩定幣捐款：「本平台僅接受指定的穩定幣作為捐款媒介，請確認您的捐款穩定幣種類正確。」<br />
            區塊鏈確認：「捐款後，您可以在區塊鏈上查詢並確認交易紀錄，確保交易的透明性和真實性。」<br />
            交易時間：「由於區塊鏈交易可能需要一些時間進行確認，請耐心等待您的捐款交易完成。」<br />
            安全提醒：「請確保您的虛擬錢包安全，避免提供私鑰或密碼給第三方。」<br />
            交易費用：「進行區塊鏈交易可能會產生一定的手續費，請事先了解並確認。」<br />
            退款政策：「由於區塊鏈交易的不可逆性，捐款一旦完成，我們將無法為您進行退款。但若募資活動未能成功，我們將開放捐款者主動提款的選項。請在捐款前確認金額並了解相關政策。」<br />
            交易隱私：「雖然區塊鏈交易是公開的，但我們尊重您的隱私，不會公開您的身份資訊。」<br />
            法律規範：「進行虛擬貨幣捐款前，請確認您所在的國家或地區允許此類交易，並遵守相關法律規定。」
          </p>
        </div>
        <div className='row mx-5 py-5'>
          <h4><b>募資活動資訊： </b></h4>
          <h5>  募資活動日期: {new Date(pool.startTime).toLocaleDateString()} ~ {new Date(pool.endTime).toLocaleDateString()}</h5>
          <h5>  募資活動進度： ${pool.currentPrice} / {pool.targetPrice}USDT，共{pool.donators.length}人參與</h5>
        </div>
        <div className='row mx-5 pb-5'>
          <h4><b>捐獻：</b></h4>
          <form onSubmit={Donate}>
            <div className="form-group">
              <label for="exampleFormControlSelect1">  輸入捐獻金額(USDT)</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} type="number" className="form-control" placeholder="輸入捐獻金額(USDT)" />
            </div>
            <button type="submit" className={`btn btn-${!validsellTime() ? 'danger' : 'primary'}`} disabled={amount <= 0 || !validsellTime()} >{validsellTime() ? '確定捐獻' : '尚未開始'}</button>
          </form>
        </div>
      </div>}
    </>
  )
}

export default PoolPage