const { ethers } = require("hardhat");
/*GasLane goerli
150 gwei Key Hash 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15

Mumbai
500 gwei Key Hash	0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f
*/
const networkConfig = {
  //network chain id, and corresponding pricefeed address
  default: {
    name: "hardhat",
    keepersUpdateInterval: "30",
  },
  31337: {
    name: "localhost",
    entranceFee: ethers.utils.parseEther("0.1"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "0",
    callbackGasLimit: "500000",
    interval: "30", //seconds
  },
  5: {
    name: "Goerli",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    entranceFee: ethers.utils.parseEther("0.1"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "10321",
    callbackGasLimit: "500000",
    interval: "200", //seconds
  },
  80001: {
    name: "polygon Mumbai",
    vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    entranceFee: ethers.utils.parseEther("0.1"),
    gasLane:
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    subscriptionId: "3517",
    callbackGasLimit: "500000",
    interval: "30", //seconds
  },
};

//networks without pricefeed addresses. development networks
const developmentChains = ["hardhat", "localhost"];
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const INITIAL_SUPPLY = "1000000000000000000000000";
module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
  INITIAL_SUPPLY,
};
