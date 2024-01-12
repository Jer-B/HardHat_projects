require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

/** network variables */
const alchemy_RPC =
  process.env.alchemy_RPC ||
  "https://eth-mainnet.alchemyapi.io/v2/your-api-key";
const wallet =
  process.env.PRIVATE_KEY_TESTNET ||
  "0x22";
const ETHERSCAN_API = process.env.ETHERSCAN_KEY || "key";
const CMC_KEY = process.env.CMC_KEY || "key";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      confirmations: 1,
    },
    localhost: {
      chainId: 31337,
    },
    alchemy_goerly: {
      url: alchemy_RPC,
      accounts: [wallet],
      saveDeployments: true,
      chainId: 5,
      blockConfirmations: 6,
    },
  },

  //account 0 deployer, account 1 player
  namedAccounts: {
    deployer: { default: 0 },
    user1: {
      default: 1,
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
  mocha: {
    timeout: 1000000, //200seconds
  },
};
