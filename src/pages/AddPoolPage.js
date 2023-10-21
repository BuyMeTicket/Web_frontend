import React, { useState } from 'react'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom';
import { instance } from '../api'
import { useAddress, useContract } from '@thirdweb-dev/react'
import { FUNDING_POOL_FACTORY_ADDRESS, USDT_ADDRESS } from '../const/contractAddress';
import { CModal, CModalBody, CButton, CModalFooter, CModalHeader, CAlert } from '@coreui/react';
import { cilWarning } from '@coreui/icons';
import { useStorageUpload } from "@thirdweb-dev/react";

const poolTemplate = {
    title: '',
    description: '',
    image: null,
    startTime: new Date(),
    endTime: new Date(),
    targetPrice: 0,
}

const AddPool = () => {
    const navigate = useNavigate();
    const { mutateAsync: upload } = useStorageUpload();
    const [pool, setPool] = useState(poolTemplate)
    const [originalImage, setOriginalImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const address = useAddress()
    const { contract: pool_factory_address } = useContract(FUNDING_POOL_FACTORY_ADDRESS);
    const [showPreview, setShowPreview] = useState(false);
    const togglePreview = () => {
        setShowPreview(true);
    };
    const closePreview = () => {
        setShowPreview(false);
    };
    const handleInput = (e) => {
        const { name, value } = e.target;
        setPool({ ...pool, [name]: value });
    }
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (e.target.name === 'image') {
                setOriginalImage(file);
                setImagePreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }
    const datesetting = () => {
        return new Date(pool.startTime).getTime() > new Date().getTime() && new Date(pool.endTime).getTime() > new Date(pool.startTime).getTime()
    }
    const allFieldsFilled = () => {
        for (let key in pool) {
            if (pool[key] === undefined || pool[key] === '' || pool[key] === 0) {
                return false;
            }
        }
        return true;
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        let data = { ...pool }; 
        for (let key in pool) {
            if (pool[key] === undefined) {
                alert("Please fill all the fields");
                return;
            }
            if (key === 'image' && originalImage !== null) {
                const uri = await upload({ data: [originalImage] });
                const urii = 'https://ipfs.io/ipfs/' + uri[0].split('/')[2] + '/' + uri[0].split('/')[3];
                console.log(urii)
                data.image=urii;
            } else {
                data.key=pool[key];
            }
        }
        const _asset = USDT_ADDRESS //mock USDT address
        const _startTimestamp = new Date(pool.startTime) //timestamp
        const startTimestamp = _startTimestamp.getTime() / 1000 //timestamp
        const _endTimestamp = new Date(pool.endTime) //timestamp
        const endTimestamp = _endTimestamp.getTime() / 1000
        const _targetPrice = pool.targetPrice //mock targetPrice
        console.log(_asset, address, startTimestamp, endTimestamp, _targetPrice)
        const result = await pool_factory_address.call("createPool", [_asset, startTimestamp, endTimestamp, _targetPrice * 10000]);
        console.info(result);
        console.info(result.receipt.events);
        console.log(JSON.stringify(result))
        const value = result.receipt.events[0].args[1];
        console.log(value);
        data.address=value
        data.holder=address;
        try {
            await instance.post('/pool/add', data).then((res) => {
                alert("Pool added");
                navigate('/pool/own');
            });
        } catch (error) {
            alert(error.message);
        }
    }


    return (
        <div className='container w-50'>
            <h2> Add Pool </h2>
            <form onSubmit={onSubmit}>
                {
                    Object.keys(poolTemplate).map((item, index) => {
                        const title = item.charAt(0).toUpperCase() + item.slice(1);
                        return (
                            <div className="form-group">
                                <label className="my-1">{title}</label>
                                <input
                                    type={item === 'image' ? 'file' : typeof pool[item] === 'object' ? 'date' : typeof pool[item]}
                                    className="form-control"
                                    value={pool[item]}
                                    name={item}
                                    onChange={item === 'image' ? handleImageChange : handleInput}
                                    placeholder={`Please ${item === 'image' ? 'upload' : 'enter'} ${title}`}
                                />
                            </div>
                        )
                    })
                }

                <div className="form-group">
                    <input
                        type="submit"
                        value="Create Pool"
                        className="btn btn-primary my-3"
                        disabled={!allFieldsFilled() || !datesetting()}
                    />
                    <>{'  '}</>
                    <CButton color="info" className="btn btn-success my-3" onClick={togglePreview}>
                        Preview
                    </CButton>
                    {!allFieldsFilled() ? <CAlert color="warning" className="d-flex align-items-center">
                        <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
                        <div>Please complete all the fields</div>
                    </CAlert> : <>{!datesetting() && <CAlert color="warning" className="d-flex align-items-center">
                        <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
                        <div>Ensure the startTime is in the future and the endTime is after the startTime.</div>
                    </CAlert>}</>}

                </div>

                <CModal size="lg" visible={showPreview} onClose={closePreview} alignment="center" className='text-black'>
                    <CModalHeader closeButton={false}>
                        <h4>Pool Preview</h4>
                    </CModalHeader>
                    <CModalBody>
                        <div className='container card p-4 w-75'>
                            <div className='d-flex justify-content-center align-items-center'>
                                <img src={imagePreview} alt="Pool" className="img-fluid mb-3" />
                            </div>
                            <div className='row mx-5 py-4'>
                                <h2>{pool.title}</h2>
                            </div>
                            <div className='row mx-5 '>
                                <h4><b>募資活動介紹：</b></h4>
                                <h5>{pool.description}</h5>
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
                                <h5>  募資活動進度： $ 0 / {pool.targetPrice} USDT，共 0 人參與</h5>
                            </div>
                            <div className='row mx-5 pb-5'>
                                <h4><b>捐獻：</b></h4>
                                <form >
                                    <div className="form-group">
                                        <label for="exampleFormControlSelect1">  輸入捐獻金額(USDT)</label>
                                        <input type="number" className="form-control" placeholder="輸入捐獻金額(USDT)" />
                                    </div>
                                    <button type="submit" className='btn btn-primary'>尚未開始</button>
                                </form>
                            </div>
                        </div>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={closePreview}>
                            Close Preview
                        </CButton>
                    </CModalFooter>
                </CModal>
            </form>
        </div>
    )
}
export default AddPool