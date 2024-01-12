const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
//const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("---------")
    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations,
        proxy: {
            // can tell to hardhat to deploy behind a proxy
            proxyContract: "OpenZeppelinTransparentProxy",
            //instead of an admin address for the proxy contract
            // proxy contract will be owned by an admin contract
            viaAdminContract: {
                name: "BoxProxyAdmin",
                artifact: "BoxProxyAdmin",
            },
        },
    })
    //    if (developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //      log("Verifying....")
    //    await verify(box.address, [])
    //}
}
