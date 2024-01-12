const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    log("get accounts...")
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("----- Checking chain Id ------")
    let priceFeedAddress
    if (developmentChains.includes(network.name)) {
        log("----- use aggregator mocks ------")
        const aggregatorV3Mock = await ethers.getContract("MockV3Aggregator")
        priceFeedAddress = aggregatorV3Mock.address
    } else {
        log("----- No need of mocks, testnet network ------")
        priceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----- Preparing args and retrieving necessary images ------")

    const LowSvg = await fs.readFileSync("./images/dinamycNft/frown.svg", { encoding: "utf8" })
    const HighSvg = await fs.readFileSync("./images/dinamycNft/happy.svg", { encoding: "utf8" })
    arguments = [priceFeedAddress, LowSvg, HighSvg]

    const dynamicContract = await deploy("DynamicSvgNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     log("verifying...")
    //     await verify(dynamicContract.address, arguments)
    //     log("-----------")
    // }
}
//hh deploy --tags DynamicNft,mocks
module.exports.tags = ["all", "DynamicNft", "main"]
