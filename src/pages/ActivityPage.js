import React, { useState, useEffect } from 'react'
import { useAddress, useContract, Web3Button } from "@thirdweb-dev/react";
import Swal from 'sweetalert2';
import { TICKET_FACTORY_ADDRESS, TOKEN_ADDRESS } from '../const/contractAddress';
import { useParams } from 'react-router-dom'
import { instance } from '../api'
import CIcon from '@coreui/icons-react'
import { cilLink } from '@coreui/icons'
import {
  CModal,
  CModalBody,
  CModalFooter,
  CButton,
  CForm
} from '@coreui/react'
import Spinner from '../components/Spinner';

const ActivityPage = () => {
  const { id } = useParams()
  const address = useAddress()
  const [activity, setActivity] = useState(null)
  const [isModal, setIsModal] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [quantity, setQuantity] = useState(0)
  const { contract: Token_Contract } = useContract(TOKEN_ADDRESS);
  const { contract: Ticket_Factory_Contract } = useContract(TICKET_FACTORY_ADDRESS);
  const getActivity = async () => {
    try {
      instance.get('/activity', { params: { _id: id } }).then((res) => {
        setActivity(res.data)
      })
    } catch (error) {
      console.log(error)
    }
  }
  const closeModal = () => {
    setTicket(null)
    setQuantity(0)
    setIsModal(false)
  }
  const buyTicket = async () => {
    const eventId = activity.eventId
    console.log(eventId)
    const ticketName = ticket.name
    console.log(ticketName)
    const Ticket_contract = await Ticket_Factory_Contract.call("eventIdToAddr", [eventId]);
    if (ticket.price !== 0) {
      await Token_Contract.call("approve", [Ticket_contract, quantity * ticket.price * 10000]);
    }

    await Ticket_Factory_Contract.call("mintEventTicket", [eventId, ticketName, quantity]);
    let noNft = ticket
    delete noNft.nft
    instance.post('/ticket/buy', { data: { ...noNft, owner: address, activity: id }, quantity }).then((res) => {
      setIsModal(false)
      setQuantity(0)
    })
  }
  const handleQuantityChange = (e) => {
    if (Number(e.target.value) > 6 || Number(e.target.value) > ticket.totalAmount - ticket.soldAmount) {
      alert('數量不可超過6張或剩餘張數')
      setQuantity(0)
      e.target.value = 0
      return
    }
    setQuantity(e.target.value)
  }
  useEffect(() => {
    getActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      {ticket && <CModal size="md" visible={isModal} onDismiss={closeModal} alignment="center" className='text-black'>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <h5>您欲購買的是： {ticket && ticket.name} {ticket && `NT$${ticket.price}`}</h5>
              <img src={ticket && ticket.nft} alt="nft" className="img-fluid mb-3" width='auto' style={{ maxHeight: '40rem' }} />
              <br />
              <label className="form-label">數量</label>
              <input type="number" className="form-control" placeholder="請輸入欲購買的數量" onChange={handleQuantityChange} />
            </div>
            <div className="mb-3">
              <h5>總價格： USDT ${ticket.price === 0 ? 'FreeMint' : quantity * ticket.price}</h5>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={closeModal}
          >
            取消
          </CButton>
          <Web3Button
            contractAddress={TICKET_FACTORY_ADDRESS}
            action={buyTicket}

            onSuccess={() => {
              Swal.fire({
                icon: 'success',
                title: 'NFT has been successfully minted',
                showConfirmButton: false,
                timer: 1500
              })
              closeModal()
              window.location.href = '/Ticket/Own'
            }}
            onError={() => {
              Swal.fire({
                icon: 'error',
                title: 'Mint failed',
              })
              closeModal()
            }}
            isDisabled={quantity === 0}
          >
            確認購買
          </Web3Button>
        </CModalFooter>
      </CModal>}
      {activity ? <div className='container card p-4 w-75'>
        <div className='d-flex justify-content-center align-items-center m-4'>
          <img src={activity.image} alt="主視覺" className="img-fluid" width='auto' style={{ maxHeight: '40rem' }} />
        </div>
        <div className='row mx-5 py-3'>
          <h2>
            {activity.title}
            <>{' '}</>
            <a href={`https://goerli.etherscan.io/address/${activity.eventAddress}`} target='_blank' rel="noopener noreferrer">
              <CIcon icon={cilLink} size='lg' />
            </a>
          </h2>
        </div>
        <div className='row mx-5'>
          <h4><b>活動介紹</b></h4>
          <h5>{activity.description}</h5>
        </div>
        <div className='row mx-5 py-3'>
          <h4><b>購買注意事項：</b></h4>
          <p>
            票券形式：「本活動的票券以NFT形式發行，每種NFT票券都是獨一無二的且紀錄上鏈的。」<br />
            區塊鏈確認：「購票後，您可以在區塊鏈上查詢並確認交易紀錄，確保交易的透明性和真實性。」<br />
            交易時間：「由於區塊鏈交易可能需要一些時間進行確認，請耐心等待您的購票交易完成。」<br />
            安全提醒：「請確保您的虛擬錢包安全，避免提供私鑰或密碼給第三方。」<br />
            交易費用：「進行區塊鏈交易可能會產生一定的手續費，請事先了解並確認。」<br />
            退票政策：「由於NFT的獨特性質，一旦購票完成，我們將無法為您進行退票。請在購票前確認日期和活動詳情。」<br />
            交易隱私：「雖然區塊鏈交易是公開的，但我們尊重您的隱私，不會公開您的身份資訊。」<br />
            法律規範：「進行NFT票券購買前，請確認您所在的國家或地區允許此類交易，並遵守相關法律規定。」
          </p>
        </div>
        <div className='row mx-5 py-4'>
          <h4><b>活動資訊：</b> </h4>
          <h5>活動日期: {new Date(activity.date).toLocaleDateString()}</h5>
          <h5>活動地點: {activity.address}</h5>
          <h5>售票時間: {new Date(activity.startSellTime).toLocaleString().slice(0, -3)} ~ {new Date(activity.endSellTime).toLocaleString().slice(0, -3)} </h5>
        </div>
        <div className='row mx-5 py-3'>
          <h4><b>票價:</b> </h4>
          {activity.tickets.map(ticket => (
            <h5>{ticket.name} USDT : ${ticket.price === 0 ? 'FreeMint' : ticket.price} {activity.startSelling && <CButton size='sm' className='p-1'
              onClick={() => {
                setTicket(ticket)
                setIsModal(true)
              }}><CIcon icon="cil-cart" size='sm' /></CButton >}
              <span>  {ticket.totalAmount - ticket.soldAmount} / {ticket.totalAmount}</span>
              <br />
            </h5>
          ))}
        </div>
      </div> : <Spinner />}
    </>
  )
}

export default ActivityPage