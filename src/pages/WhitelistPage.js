import React from 'react';
import { useAddress } from "@thirdweb-dev/react";
import { instance,backend_uri } from '../api'
import Swal from 'sweetalert2';
import * as Passwordless from "@passwordlessdev/passwordless-client";
import {API_KEY, API_URL } from "../const/backend";
function WhitelistPage() {
    const address = useAddress();
    console.log("Using API key: " + API_KEY);
    const handleWhitelist = async (e) => {
        try {
            const response = await instance.post('/user/add', { user: address })
            console.log(address);

            if (response) {
                console.log('Address added successfully');
            } else {
                console.error('Error adding address');
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };
    const register = async () => {
        const alias = address;
        const p = new Passwordless.Client({
            apiUrl: API_URL,
            apiKey: API_KEY
        });
        // Create token - Call your node backend to retrieve a token that we can use client-side to register a passkey to an alias
        const backendRequest = await backend_uri.get('/create-token', { params: { alias: alias } })
        console.log(backendRequest);
        const backendResponse = backendRequest.data;
        if (!backendRequest.status===200) {
            console.log("Our backend failed while creating a token!")
            return;
        }

        // Register a key - The Passwordless API and browser creates and stores a passkey, based on the token.
        try {
            const { token, err } = await p.register(backendResponse.token, address);
            if (token) {
                Swal.fire({
                    icon: 'success',
                    title: 'Successfully registered WebAuthn!',
                    showConfirmButton: false,
                    timer: 1500
                })
                //add address to backend whitelist
                handleWhitelist();
            } else {
                console.log("Failed to register WebAuthn!", err)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Failed to register WebAuthn!',
                })
            }
            // Done - the user can now sign in using the passkey
        } catch (e) {
            console.error("Things went bad", e);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Things went bad',
            })
        }
    }
    const verify = async () => {
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
                    title: 'Congratuation!! Get Whitelist!',
                    showConfirmButton: false,
                    timer: 1500
                })
                //add address to backend whitelist
                handleWhitelist();
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
    return (
        <div className='container'>
            <h1>
                BuyMeTicket Whitelist
            </h1>
            <h3>
                Please register and Verify to get BuyMeTicket Whitelist
            </h3>
            <div>
                <p><strong>驗證概念：</strong>Passwordless 驗證系統允許您無需記住複雜的密碼即可安全地訪問您的帳戶。結合 passkey 驗證,您僅需結合手機驗證即可完成驗證。</p>
                <p><strong>如何操作：</strong>當您試圖登錄或執行需要驗證的操作時,系統會顯示一個一次性的 QrCode 到頁面。請在短時間內以綁定裝置完成驗證。</p>
                <p><strong>便捷性：</strong>由於每次驗證都使用裝置的 passkey。結合快速的生物特徵辨識,大大減少了輸入密碼的耗損時間。</p>
                <p><strong>提醒：</strong>請確保您的綁定裝置安全，避免任何未經授權的訪問。如果您認為您手機已被侵入或裝置遺失,請立即與我們的客服部門聯繫。</p>
                <p><strong>客服和支援：</strong>如果您在使用passwordless和passkey驗證過程中遇到任何問題或疑問,請隨時聯繫我們的支援團隊。為了您的安全,請避免從第三方網站或未經授權的個人處獲取幫助。</p>
            </div>
            <div>
                <button
                    className={`btn btn-${'primary'}`}
                    margin={'8px'}
                    onClick={register}
                    color={'black'}
                >
                    Register
                </button>
                <>{" "}</>
                <button
                    className={`btn btn-${'success'}`}
                    onClick={verify}
                    color={'black'}
                >
                    Verify
                </button>
            </div>
        </div>
    );
}
export default WhitelistPage;