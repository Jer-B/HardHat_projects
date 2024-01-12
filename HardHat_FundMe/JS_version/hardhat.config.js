require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("./tasks/block-number")
require("./tasks/accounts")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
//require("@nomiclabs/hardhat-waffle")

/** network variables */
const alchemy_RPC =
    process.env.alchemy_RPC ||
    "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const wallet =
    process.env.PRIVATE_KEY_TESTNET ||
    "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a"
const ETHERSCAN_API = process.env.ETHERSCAN_KEY || "key"
const CMC_KEY = process.env.CMC_KEY || "key"

/** add a network to networks, and as parameter an url, a chain id and a list of accounts, works totally fine with only one */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        alchemy_goerly: {
            url: alchemy_RPC,
            accounts: [wallet],
            chainId: 5,
            //add a block confirmations waiting time
            blockConfirmations: 6,
        },

        //hardhat local node -> yarn hardhat node
        //localNode: {
        //  url: "http://127.0.0.1:8545/",
        //accounts: -> automaticaly picked up from the account list of the node
        // same as the temporary local hardhat chain
        //chainId: 31337,
        //},
    },
    //solidity: "0.8.17",
    // turn solidity into an object to have the ability to compile multiple version
    solidity: {
        //list of compilers
        compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: ETHERSCAN_API,
    },
    gasReporter: {
        enabled: true,
        // when output to a txt file it doesnt show up in CLI
        // outputFile: "gas-report.txt",
        // noColors: true,
        currency: "USD",
        coinmarketcap: CMC_KEY,
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            //by default the 0 indexed account is gonna be deployer
            default: 0,
            // can set the index number by default for different chain.
            // let say default is 0 for hardhat, but 1 for goerly and 2 for localnode
            //31337: 0,
            //5: 0,
        },
        //can add / change other indexes
        // user: {
        //     default: 1,
        // },
    },
}
