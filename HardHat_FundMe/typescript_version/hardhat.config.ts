import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "dotenv/config"
import "@nomiclabs/hardhat-etherscan"
import "./tasks/block-number"
import "./tasks/accounts"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "@typechain/hardhat"
import "hardhat-deploy"

/** network variables */
const alchemy_RPC = process.env.alchemy_RPC || "https://blal.com"
const wallet = process.env.PRIVATE_KEY_TESTNET || "0xerfe"
const ETHERSCAN_API = process.env.ETHERSCAN_KEY || "key"
const CMC_KEY = process.env.CMC_KEY || "key"

/** add a network to networks, and as parameter an url, a chain id and a list of accounts, works totally fine with only one */

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
    solidity: "0.8.17",
    defaultNetwork: "hardhat",
    networks: {
        alchemy_goerly: {
            url: alchemy_RPC,
            accounts: [wallet],
            chainId: 5,
        },

        //hardhat local node -> yarn hardhat node
        localNode: {
            url: "http://127.0.0.1:8545/",
            //accounts: -> automaticaly picked up from the account list of the node
            chainId: 31337, // same as the temporary local hardhat chain
        },
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
            31337: 2,
            5: 1,
        },
        //can add / change other indexes
        user: {
            default: 1,
        },
    },
}

export default config
