require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const MAINNET_RPC_URL =
    process.env.ALCHEMY_FORK ||
    process.env.ALCHEMY_MAINNET_RPC_URL ||
    "https://eth-goerli.alchemyapi.io/v2/your-api-key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const GOERLI_RPC_URL = process.env.alchemy_RPC || "https://eth-goerli.alchemyapi.io/v2/your-api-key"
const SEPOLIA_RPC_URL =
    process.env.alchemy_RPC_sepolia || "https://eth-goerli.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY_TESTNET ||
    "0x222"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            gas: 6000000,
            // gasPrice: 130000000000,
            // forking: {
            //     url: MAINNET_RPC_URL,
            // },
        },
        localhost: {
            chainId: 31337,
            gas: 6000000,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        mainnet: {
            url: MAINNET_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 1,
            blockConfirmations: 6,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.17",
            },
            {
                version: "0.8.8",
            },
            {
                version: "0.8.0",
            },
            {
                version: "0.6.12",
            },
            {
                version: "0.6.0",
            },
            {
                version: "0.4.19",
            },
        ],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        //coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
    mocha: {
        timeout: 200000, // 200 seconds max for running tests
    },
}
