const Moralis = require("moralis-v1/node")
require("dotenv").config()

const contractAddresses = require("./constants/networkMapping.json")

let chainId = process.env.chainId || 31337
let moralisChainId = chainId == "31337" ? "1337" : chainId
const contractAddress = contractAddresses[chainId]["NftMarketplace"][0]
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
const appId = process.env.NEXT_PUBLIC_APPLICATION_ID
const masterKey = process.env.MASTER_KEY

async function main() {
    await Moralis.start({ serverUrl, appId, masterKey })
    console.log(`Working with contract address ${contractAddress}`)

    //item listed event
    let itemListedOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        address: contractAddress,
        topic: "ItemListed(address, address,uint256,uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemListed",
            type: "event",
        },
        tableName: "ItemListed",
    }

    let itemBoughtOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        address: contractAddress,
        topic: "ItemBought(address, address,uint256,uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "buyer",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
                {
                    indexed: false,
                    internalType: "uint256",
                    name: "price",
                    type: "uint256",
                },
            ],
            name: "ItemBought",
            type: "event",
        },
        tableName: "ItemBought",
    }

    let itemCanceledOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        address: contractAddress,
        topic: "ItemCanceled(address, address,uint256)",
        abi: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: "address",
                    name: "seller",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "address",
                    name: "nftAddress",
                    type: "address",
                },
                {
                    indexed: true,
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            name: "ItemCanceled",
            type: "event",
        },

        tableName: "ItemCanceled",
    }

    //send data tp the database
    const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, {
        useMasterKey: true,
    })
    const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, {
        useMasterKey: true,
    })
    const canceledResponse = await Moralis.Cloud.run("watchContractEvent", itemCanceledOptions, {
        useMasterKey: true,
    })

    if (listedResponse.success && canceledResponse.success && boughtResponse.success) {
        console.log("Success ! Database updated through events")
    } else {
        console.log("Events sync went Wrong!")
    }
}
//run it
// node addEvents.js
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
