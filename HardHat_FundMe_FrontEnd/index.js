// import
import { ethers } from "./ethers-5.2.esm.min.js"
import { abi, contractAddress } from "./constants.js"

//add buttons

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

//==========
// V1 of connect function
//==========

// async function connect() {
//   //check if window.ethereum is defined, meaning metamask is installed or not
//   if (typeof window.ethereum !== "undefined") {
//     console.log("Metamask detected");
//     // if there is a metamask try to connect to it by requesting the account
//     await window.ethereum.request({ method: "eth_requestAccounts" });
//     //console.log("Connected !");
//     document.getElementById("connectButton").innerHTML = "Connected";
//   } else {
//     document.getElementById("connectButton").innerHTML = "Install Metamask.";
//     //console.log("No Metamask detected");
//   }
// }

//==========
// V2 of connect function, try and catch pattern to handle some errors
//==========

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "connected"
        // take a look at the entier ethers object
        console.log(ethers)
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        connectButton.innerHTML = "no metamask"
    }
}

//==========
// requirement for sending a transaction
//==========
// - provider + signer -> use of ethers
// - ABI + address of the contract to interact with

async function fund() {
    // hardcode ethAmount instead of parameters for a try
    //const ethAmount = "10"
    // grab value from input field
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount} ...`)
    if (typeof window.ethereum !== "undefined") {
        // use provider that is used in metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // then to get the account, get the signer of that provider, so the account connected into metamask to our website
        const signer = provider.getSigner()
        // take a look a the signer
        console.log(signer)
        // get contract address from constants, then the ABI and signer
        const contract = new ethers.Contract(contractAddress, abi, signer)

        // start transactions
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // wait for tx to be mined
            await listenForTransactionToBeMined(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

//function for getting the balance
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

//withdraw function
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            // wait for tx to be mined
            await listenForTransactionToBeMined(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    }
}

// transaction listener functions
// taking the transaction and provider as parameters
function listenForTransactionToBeMined(transactionResponse, provider) {
    //not asynchronous, will return a new promise. and be awaiting in other functions
    console.log(`Mining TX hash: ${transactionResponse.hash} ...`)
    return new Promise((resolve, reject) => {
        //create the listener, when an event occur, calls the defined function
        // like waiting for a transaction receipt
        // provider.once or contract.once can be used. more in ethers doc
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with: ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
    // when transaction is done, call a nothing function aka this listener
    // note at this stage it is an event loop. it finishes before the function finish before it has verified
    // the receipt confirmation. its where the promise comes in. to tell, wait the receipt before going further.
    // we can see this by putting a console.log into fund after the verification of that function
    //and see that the log fires before the transaction receipt comes in

    // promises takes 2 parameters input, resolve and reject.
    // resolve -> if work well do this, else reject
    // as it is has a await keyword in fund, it is gonna wait to return the promise, resolved or rejected before going further
}
