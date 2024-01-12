//hardhat-deploy still needs to have dependencies imported
// doesnt need main function
// doesnt need to call main function
// works a bit differently
// its actually gonna call a function that we specify, deployFunc.
// and make it a default function for hardhat-deploy to look for

// passing hardhat runtime environment as argument to this function -> hre
// code example:
/*
function deployFunc(hre) {
    console.log("Run me using: yarn hardhat-deploy")
    hre.getNamedAccounts()
    hre.deployments()
}

module.exports.default = deployFunc
*/

// the true necessary syntax is a quiet different, see documentation
// https://github.com/wighawag/hardhat-deploy#deploy-scripts

// actually we are going to use a nameless asynchronous function
//wrapped in module.export

//module.exports = async (hre) => {
//we are going to use 2 variables from HRE
// to pull them out of hre, here is the syntax
//  const { getNamedAccounts, deployments } = hre
// same as doing
// hre.getNamedAccounts
// hre.deployments
//}

// javascript as what is called syntatic sugar.
// we can make it a one line declaration meaning the same.
/*
module.exports = async({getNamedAccounts, deployments}) =>{}
*/

//import network hardhat
const { network } = require("hardhat")

// import networkConfig
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

// import verify
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    // we are using the deployments object to get 2 functions
    // which are deploy and log functions
    // to keep track of our deployments
    const { deploy, log } = deployments

    // and get deployer, aka the signer, from getNamedAccounts function
    // allow us to not have an account indexed list anymore but an account list using names
    // grab defined deployer account from our hardhat.config.js namedAccounts declaration
    const { deployer } = await getNamedAccounts()

    //then grab chainId
    const chainId = network.config.chainId

    //depending on the chainid grab a different priceFeed address for the ETH / USD pair
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    //instead of having ethUsdPriceFeedAddress a constant variable, initialize it to nothing
    let ethUsdPriceFeedAddress
    //if condition depending on the network
    // so if locals
    if (developmentChains.includes(network.name)) {
        //attribute the most recent deployed Mock contract to ethUsdAggregator
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        // can just do get instead of deployments.get, if adding get to imported variables for deployments at the top

        //pass the contract address to pricefeed address
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }

    //if not locals
    else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // to deploy contract we need the name of the contract and a list of overrides
    // which says who is actually deploying it, arguments and a list of arguments
    // tracking deployments / version logs
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // priceFeed addresses
        log: true,
        // wait few blocks to catch up.
        // wait 6 from hardhat config if goerli, or 1 if none specified and other networks
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    //verify if not local chain

    // if (
    //.     !developmentChains.includes(network.name) &&
    //     process.env.ETHERSCAN_KEY
    // ) {
    //     //verify
    //     await verify(fundMe.address, args)
    // }

    log("deployed!")
}

module.exports.tags = ["all", "fundme"]
