const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
// const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    //const chainId = network.config.chainId

    log("Deploying contract")
    const arguments = []
    //deploy nftMarketplace.sol
    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("Contract deployed")

    //verify
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_KEY) {
        log("Verifying contract on etherscan....")
        await verify(nftMarketplace.address, args)
        log("verified!")
    }
}

module.exports.tags = ["all", "nftmarketplace"]
