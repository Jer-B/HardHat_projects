const fs = require("fs")
const { network, ethers } = require("hardhat")
//const { contractAddress } = require("constants/")
const {
    contractAddress,
} = require("../../../Lesson 10 NextJS Smart Contract Lottery (Full Stack - Front End)/my_js_version/constants/")

//const FRONT_END_ADRESSES_FILE = "../constants/contractAddresses.json"
const FRONT_END_ADRESSES_FILE =
    "../../Lesson 10 NextJS Smart Contract Lottery (Full Stack - Front End)/my_js_version/constants/contractAddresses.json"
// const FRONT_END_ABI_FILE = "constants/abi.json"
const FRONT_END_ABI_FILE =
    "../../Lesson 10 NextJS Smart Contract Lottery (Full Stack - Front End)/my_js_version/constants/abi.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end address and ABI...")
        await updateAbi()
        await updateContractAddresses()
    }
}

async function updateAbi() {
    const raffle = await ethers.getContract("Raffle")
    //get abi from the raffle object, more about ethers.utils.FormatTypes in ethers docs
    fs.writeFileSync(FRONT_END_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    //as this adress variable might be used at various places make it a constant variable
    //using the relative path to where that adress can be used same for ABI
    const raffle = await ethers.getContract("Raffle")
    const chainId = network.config.chainId.toString()
    console.log("Chain Id is ", chainId)
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADRESSES_FILE, "utf8"))
    //keep track of adresses for any chains

    if (chainId in currentAddresses) {
        if (!contractAddress[chainId].includes(raffle.address)) {
            contractAddress[chainId].push(raffle.address)
        }
    }
    // if chainId doesnt exist
    else {
        currentAddresses[chainId] = [raffle.address]
    }
    fs.writeFileSync(FRONT_END_ADRESSES_FILE, JSON.stringify(currentAddresses))
}

module.exports.tags = ["all", "frontend"]
