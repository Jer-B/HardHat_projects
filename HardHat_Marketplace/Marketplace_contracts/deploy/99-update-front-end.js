const { ethers, network } = require("hardhat")
const fs = require("fs")
const frontEndContractsFile = "../my_next_frontend_moralis/constants/networkMapping.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating front end...")
        await updateContractAddresses()
    }
}

async function updateContractAddresses() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    // get chain id
    const chainId = network.config.chainId.toString()
    // read addresses
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddresses) {
        console.log("checking chainId")
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
        } else {
            contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
        }
    }
    //write to networkMapping
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
// yarn hardhat deploy --network localhost --tags frontend
