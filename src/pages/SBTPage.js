import React from 'react';
import { useAddress, useContract, Web3Button, useContractRead } from "@thirdweb-dev/react";
import {TICKET_ADDRESS} from '../const/contractAddress';
import Web3 from 'web3'
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';
const { utils } = Web3
const whitelistAddresses = [
    '0x337C43C2F5Eb9940FcaE6Df9720c98BE4feD12E8',
    '0x33E92cb60B140f9dCD6E4C163ea87a34cEBcCEbE',
    '0x9DB36029198CD3Dc70DE207be6918558AB0b70ea',
].map((x) => utils.toChecksumAddress(x));


function Home() {
    const address = useAddress();
    const leafNodes = whitelistAddresses.map((whitelistAddress) => keccak256(whitelistAddress));
    
    // console.log(_merkleProof[2]);
    const { contract } = useContract(TICKET_ADDRESS);
    const {
        data: nowSupply,
        isLoading: loadingNowSupply
    } = useContractRead(contract, 'nowSupply')
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    const rootHex = merkleTree.getHexRoot();
    const proof = merkleTree.getHexProof(keccak256(address));
    console.log(proof);
    console.log(rootHex);
    return (
        <main className="main">
            <div className="container text-white px-0">
                <h1>
                    BuyMeTicket SoulBound Token
                </h1>
                <div className="info-box">
                    <p><strong>代幣概念：</strong>靈魂綁定代幣是一種特殊的代幣，當您持有它時，它會與您的數字身份綁定。</p>
                    <p><strong>鑄造和持有：</strong>請確保使用的是您主要的數字錢包，因為這個代幣會與您的錢包地址綁定。</p>
                    <p><strong>安全性：</strong>由於代幣的綁定性質，確保您的錢包私鑰安全。如果您丟失了對錢包的訪問權限，您也可能永久地丟失這些代幣。</p>
                    <p><strong>客服和支援：</strong>如果您在使用靈魂綁定代幣時遇到問題,請聯繫BuyMeTicket平台的信箱。不要從第三方網站或未經授權的個人處獲取幫助。</p>
                </div>
                <div>
                    <Web3Button
                        contractAddress={TICKET_ADDRESS}
                        action={(contract) => {
                            contract.call("mintWhitelist", [proof])
                        }}
                    >
                        Mint SBT
                    </Web3Button>
                </div>
            </div>
        </main >
    );
}
export default Home;