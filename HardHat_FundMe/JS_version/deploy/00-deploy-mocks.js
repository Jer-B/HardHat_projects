// deploy pricefeed mock contract for when using a local environment
// or a chain that doesnt have a pricefeed contract on it.

//import network hardhat
const { network } = require("hardhat")
// import networkConfig
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // condition about which network is used
    // includes keyword check to see if some variables are inside an array

    //can use both option under. in hardhat config we are using names -> ["hardhat", "localhost"]
    //not chainIds

    //const chainId = network.config.chainId
    //if (chainId == "31337"){

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying Mocks...")
        await deploy("MockV3Aggregator", {
            // can be more specific when deploying a contract using an array of informations
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            // take 2 arguments. see MockV3Aggregator constructor from chainlink
            // must be in same order
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
    }
}

// exports module using tags, like a grep way to select what contract to deploy by using its tag

module.exports.tags = ["all", "mocks"]

// then use
// yarn hardhat deploy --tags mocks
