import Onboard from "bnc-onboard";
import Web3 from "web3";
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import RangeSlider from 'react-bootstrap-range-slider';
import ABI from "./contractABI.json";
import ReactDOM from "react-dom";
import { useState } from "react";
require("dotenv").config()

const contractAddress = process.env.contractAddress;

const FORTMATIC_KEY = process.env.FORTMATIC_KEY;
const RPC_URL = process.env.RPC_URL;
const INFURA_KEY = process.env.INFURA_KEY;

const wallets = [
    { walletName: "coinbase", preferred: true },
    { walletName: "trust", preferred: true, rpcUrl: RPC_URL },
    { walletName: "metamask", preferred: true },
    { walletName: "authereum" },
    { walletName: "ledger", rpcUrl: RPC_URL },
    { walletName: "fortmatic", apiKey: FORTMATIC_KEY, preferred: true },
    { walletName: "walletConnect", infuraKey: INFURA_KEY },
    { walletName: "opera" },
    { walletName: "operaTouch" },
    { walletName: "torus" },
    { walletName: "status" },
    { walletName: "imToken", rpcUrl: RPC_URL }
];

var web3;

var myContract;

const onboard = Onboard({
    dappId: process.env.dappId,
    networkId: 4,
    walletSelect: {
        wallets: wallets
    },
    subscriptions: {
        wallet: (wallet) => {
            window.localStorage.setItem("selectedWallet", wallet.name);
            web3 = new Web3(wallet.provider);
            console.log(wallet.name);
            myContract = new web3.eth.Contract(ABI, contractAddress)
        }
    }
});


const BlockNative = () => {

    const [wltAddress, setWltAddress] = useState("Not Connected");

    async function login() {
        const walletSelected = await onboard.walletSelect();
        if (walletSelected !== false) {
            const walletCheck = await onboard.walletCheck();
            setWltAddress(onboard.getState().address);

        }
    }

    return (
        <div>
            <div className="App">
                <button id="connectWallet" className="connectWalletButton" onClick={login}>
                    Connect wallet
                </button>
                <p className="walletAddress">{wltAddress}</p>
            </div>


        </div>
    )
}

const Mint = () => {
    async function buyNFT() {
        const currentState = onboard.getState();
        getPrice();
        myContract.methods.mint(value)
            .send({ from: currentState.address, value: value * price })
            .on("transactionHash", function (hash) {
                console.log(hash);
            })
            .on("confirmation", function (confirmationNumber, reciept) {
                console.log(confirmationNumber);
            })
            .on("receipt", function (receipt) {
                console.log(receipt);
                getPrice();
            })
            .on("error", function (error, receipt) {
                console.log(error);
            })
            .catch(err => {
                console.log(err);
            });
    }

    const [value, setValue] = useState(1);
    const [totalMinted, setTotal] = useState();

    const [price, setPrice] = useState(40);

    async function getPrice() {
        const currentState = onboard.getState();
        myContract.methods.getPrice()
            .send({ from: currentState.address })
            .then((res) => {
                setPrice(res);
            })
            .catch((err) => {
                console.log(err);
            });
    }
    async function getTotalMinted() {
        const currentState = onboard.getState();
        myContract.methods.getMinted()
            .send({ from: currentState.address })
            .then((res) => {
                setTotal(res);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return (
        <div>
            <p placeholder="40 Matic">{price * value} Matic</p>
            <button onClick={buyNFT} className="connectWalletButton"  >
                Mint NFT
            </button>
            <RangeSlider
                value={value}
                onChange={changeEvent => setValue(changeEvent.target.value)}
                min={1}
                max={10}
                step={1}
            />
        </div>
    )
}


export {
    BlockNative,
    Mint
}