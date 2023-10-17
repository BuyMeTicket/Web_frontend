/*global ethereum*/
import React from 'react';
import { useAddress, useContract } from "@thirdweb-dev/react";
import { USDT_ADDRESS } from '../const/contractAddress';
function FaucetPage() {
    const address = useAddress();
    const { contract: usdt_contract } = useContract(USDT_ADDRESS);
    const getUSDT = async () => {
        await usdt_contract.call("freeMint", [address, 10000000]);
    }
    const addMetaMask = async (address) => {
        try {

            // wasAdded is a boolean. Like any RPC method, an error may be thrown.
            const wasAdded = await ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20', // Initially only supports ERC20, but eventually more!
                    options: {
                        address: USDT_ADDRESS, // The address that the token is at.
                        symbol: "USDT", // A ticker symbol or shorthand, up to 5 chars.
                        decimals: 4, // The number of decimals in the token
                    },
                },
            });
            if (wasAdded) {
                console.log('Thanks for your interest!');
            } else {
                console.log('Your loss!');
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='container'>
            <h1>
                Get Mock USDT Token
            </h1>
            <div>
                <p>1000 Mock USDT for you per transaction</p>
                <button
                    className={`btn btn-${'primary'}`}
                    margin={'8px'}
                    onClick={getUSDT}
                    color={'black'}
                >
                    Get Token
                </button>
                <>{'   '}</>
                <button onClick={() => addMetaMask(USDT_ADDRESS)}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask Icon" width="30" height="30" />
                </button>
            </div>
        </div>
    );
}
export default FaucetPage;