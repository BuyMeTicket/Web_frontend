import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader,CAlert } from '@coreui/react'
import { cilWarning } from '@coreui/icons';
import { instance } from '../api';
import { useAddress, useContract } from '@thirdweb-dev/react'
import { TICKET_FACTORY_ADDRESS, USDT_ADDRESS } from '../const/contractAddress';
import { useStorageUpload } from "@thirdweb-dev/react";

const activityTemplate = {
  title: '',
  description: '',
  image: null,
  date: new Date(),
  address: '',
  startSellTime: new Date(),
  endSellTime: new Date(),
}
const ticketTemplate = {
  name: '',
  price: 0,
  totalAmount: 0,
  soldAmount: 0,
}


function updateImageUri(uri, name, ticketType, ticketDescription) {
  return {
    "description": ticketDescription,
    "external_url": "",
    "image": uri,
    "name": name,
    "attributes": [
      {
        "trait_type": "ticket_type",
        "value": ticketType,
      }
    ]
  }
}
const AddActivity = () => {
  const navigate = useNavigate();
  const { mutateAsync: upload } = useStorageUpload();
  const [act, setAct] = useState(activityTemplate);
  const [tickets, setTickets] = useState([ticketTemplate]);
  const [originalImage, setOriginalImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [nfts, setNfts] = useState([]);
  const [isModal, setIsModal] = useState(false)
  const address = useAddress()
  const [quantity, setQuantity] = useState(0)
  const { contract: Ticket_Factory_Contract } = useContract(TICKET_FACTORY_ADDRESS);
  const [showPreview, setShowPreview] = useState(false);
  const [ticket, setTicket] = useState(null)
  const togglePreview = () => {
    setShowPreview(prev => !prev);
    setIsModal(false)
  };
  const handleInput = (e) => {
    const { name, value } = e.target;
    setAct({ ...act, [name]: value });
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
  const closeModal = () => {
    setTicket(null)
    setIsModal(false)
  }
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (e.target.name === 'image') {
        setOriginalImage(file);
        setImagePreview(reader.result);
      } else setNfts(prev => [...prev, file]);
    };
    reader.readAsDataURL(file);
  }
  const allFieldsFilled = () => {
    for (let key in act) {
      if (act[key] === undefined || act[key] === '') {
        return false;
      }
    }
    for (let ticket of tickets) {
      for (let key in ticket) {
        if (ticket[key] === undefined || ticket[key] === '') {
          return false;
        }
      }
    }
    return true;
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    let data = { ...act };
    data.holder=address;
    for (let key in act) {
      if (act[key] === undefined) {
        alert("Please fill all the fields");
        return;
      }
      if (key === 'image' && originalImage !== null) {
        const uri = await upload({ data:[originalImage] });
        const urii = 'https://ipfs.io/ipfs/' + uri[0].split('/')[2] + '/' + uri[0].split('/')[3];
        console.log(urii)
        data.image=urii;
      } else {
        data.key=act[key];
      }
    }
    console.log(nfts);
    const uploadJson = [];
    const uris = await upload({ data: nfts });
    //get the image's uri add to image's property and use it to produce json file for metadata
    for (let i = 0; i < uris.length; i++) {
      const urii = 'https://ipfs.io/ipfs/' + uris[i].split('/')[2] + '/' + uris[i].split('/')[3];
      console.log(urii)
      tickets[i].nft = urii;
      const json = updateImageUri(urii, act.title, tickets[i].name, tickets[i].description);
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      const formData = new File([blob], `${i}.json`, { type: "application/json" });
      console.log(formData);
      uploadJson.push(formData);
    }
    data.tickets=JSON.stringify(tickets);
    //upload json file
    const ipfsString = await upload({ data: uploadJson });
    const baseIpfsUrl = 'https://ipfs.io/ipfs/' + ipfsString[0].split('/')[2] + '/';
    console.log(baseIpfsUrl);
    const _asset = USDT_ADDRESS //mock USDT address
    const _contractName = act.title //Event Name
    const _baseURI = baseIpfsUrl //TODO: enter URI
    const _maxPerWallet = 6 //defalut 6
    const _startTimestamp = new Date(act.startSellTime) //timestamp
    const startTimestamp = _startTimestamp.getTime() / 1000 //timestamp
    const _endTimestamp = new Date(act.endSellTime) //timestamp
    const endTimestamp = _endTimestamp.getTime() / 1000 //timestamp
    const _mintPrices = []
    const _maxSupplys = []
    const _names = []
    const _ids = []
    for (let tikki in tickets) {
      _mintPrices.push(tickets[tikki].price * 10000)
      _maxSupplys.push(tickets[tikki].totalAmount)
      _names.push(tickets[tikki].name)
      _ids.push(tikki)
    }
    const result = await Ticket_Factory_Contract.call("createEvent", [_asset, _contractName, _baseURI, _maxPerWallet, startTimestamp, endTimestamp, _mintPrices, _maxSupplys, _names, _ids])
    const datatemplate = result.receipt.events;
    let targetAddress;
    for (let event of datatemplate) {
      if (event.event === "ERC1155Created") {
        targetAddress = event.args[1];
        break;
      }
    }
    const _eventId = await Ticket_Factory_Contract.call("eventNameToId", [act.title])
    data.eventAddress=targetAddress
    data.eventId=_eventId?.toString()
    console.log(data);
    await instance.post('/activity/add', data)
      .then(res => {
        alert("Activity created successfully");
        navigate('/activities')
      })
      .catch(err => console.log("error in create activity", err))
  };

  return (
    <div className="container w-50">
      <h3>Create New Activity</h3>
        <form onSubmit={onSubmit}>
          {
            Object.keys(activityTemplate).map((item, index) => {
              const title = item.charAt(0).toUpperCase() + item.slice(1);
              return (
                <div className="form-group">
                  <label className="my-1">{title}</label>
                  <input
                    type={item === 'image' ? 'file' : typeof act[item] === 'object' ? 'date' : typeof act[item]}
                    className="form-control"
                    value={act[item]}
                    name={item}
                    onChange={item === 'image' ? handleImageChange : handleInput}
                    placeholder={`Please ${item === 'image' ? 'upload' : 'enter'} ${title}`}
                  />
                </div>
              )
            })
          }
          {
            tickets.map((ticket, i) => {
              return (
                <div className="my-2">
                  <h3 className="my-1 d-flex">Ticket {i + 1}</h3>
                  {
                    Object.keys(tickets[i]).filter(item => item !== 'soldAmount').map((item, index) => {
                      const title = item.charAt(0).toUpperCase() + item.slice(1);
                      return (
                        <div className="form-group" key={index}>
                          <label className="my-1">{title}</label>
                          <input
                            type={typeof ticket[item]}
                            className="form-control"
                            value={ticket[item]}
                            name={item}
                            onChange={(e) => {
                              e.preventDefault();
                              const { name, value } = e.target;
                              setTickets([...tickets.slice(0, i), { ...tickets[i], [name]: value }, ...tickets.slice(i + 1)])
                            }}
                            placeholder={`Please enter ${title}`}
                          />
                        </div>
                      )
                    })
                  }
                  <div className="form-group">
                    <label className="my-1">NFT</label>
                    <input
                      type="file"
                      className="form-control"
                      name="nft"
                      onChange={handleImageChange}
                      placeholder={`Please upload NFT`}
                    />

                  </div>

                </div>
              )
            })
          }
          <CButton onClick={e => {
            e.preventDefault()
            setTickets([...tickets, ticketTemplate])
          }}>+</CButton><br />
          <div className="form-group">

            <input
              type="submit"
              value="Create Activity"
              className="btn btn-primary my-3"
              disabled={!allFieldsFilled()}
            />
            <>{'  '}</>
            <CButton color="info" className="btn btn-success my-3" onClick={togglePreview}>
              Preview
            </CButton>
            { !allFieldsFilled() &&<CAlert color="warning" className="d-flex align-items-center">
              <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
              <div>Please complete all the fields</div>
            </CAlert>}
          </div>


          <CModal size="lg" visible={showPreview} onDismiss={togglePreview} alignment="center" className='text-black'>
            <CModalHeader closeButton={false}>
              <h4>Activity Preview</h4>
            </CModalHeader>
            <CModalBody>
              {ticket && <CModal size="md" visible={isModal} onDismiss={closeModal} alignment="center" className='text-black'>
                <CModalBody>
                  <div className="mb-3">
                    <h5>您欲購買的是： {ticket && ticket.name} {ticket && `NT$${ticket.price}`}</h5>
                    <img src={imagePreview} alt={ticket.name} className="img-fluid mb-3" />
                    <br />
                    <label className="form-label">數量</label>
                    <input type="number" className="form-control" placeholder="請輸入欲購買的數量" onChange={handleQuantityChange} />
                  </div>
                  <div className="mb-3">
                    <h5>總價格： USDT ${ticket.price === 0 ? 'FreeMint' : quantity * ticket.price}</h5>
                  </div>
                </CModalBody>
                <CModalFooter>
                  <CButton
                    color="secondary"
                    onClick={closeModal}
                  >
                    取消
                  </CButton>
                </CModalFooter>
              </CModal>}
              <div className='container card p-4 w-75'>
                <div className='d-flex justify-content-center align-items-center m-4'>
                  <img src={imagePreview} alt="Activity" className="img-fluid" width='auto' style={{ maxHeight: '40rem' }} />
                </div>
                <div className='row mx-5 py-3'>
                  <h2>{act.title}</h2>
                </div>
                <div className='row mx-5'>
                  <h4><b>活動介紹</b></h4>
                  <p>{act.description}</p>
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
                  <h5>活動日期: {new Date(act.date).toLocaleDateString()}</h5>
                  <h5>活動地點: {act.address}</h5>
                  <h5>售票時間: {new Date(act.startSellTime).toLocaleString().slice(0, -3)} ~ {new Date(act.endSellTime).toLocaleString().slice(0, -3)} </h5>
                </div>
                <div className='row mx-5 py-3'>
                  <h4><b>票價:</b> </h4>
                  {tickets.map(ticket => (
                    <h5>{ticket.name} USDT : ${ticket.price === 0 ? 'FreeMint' : ticket.price}
                      <CButton size='sm' className='p-1'
                        onClick={() => {
                          setTicket(ticket)
                          setIsModal(true)
                        }}><CIcon icon="cil-cart" size='sm' /></CButton >
                      <span>  {ticket.totalAmount - ticket.soldAmount} / {ticket.totalAmount}</span>
                      <br />
                    </h5>
                  ))}
                </div>
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={togglePreview}>
                Close Preview
              </CButton>
            </CModalFooter>
          </CModal>

        </form>
    </div>
  );
};

export default AddActivity;
