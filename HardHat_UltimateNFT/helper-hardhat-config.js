const networkConfig = {
    31337: {
        name: "localhost",
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
        entranceFee: ethers.utils.parseEther("0.1"),
        //gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        subscriptionId: "0",
        callbackGasLimit: "50000",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        mintFee: "10000000000000000", // 0.01 ETH
        interval: "30", //seconds
    },
    // Due to the changing testnets, this testnet might not work as shown in the video
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        wethToken: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        // This is the AaveV2 Lending Pool Addresses Provider
        lendingPoolAddressesProvider: "0x5E52dEc931FFb32f609681B8438A51c675cc232d",
        // This is LINK/ETH feed
        daiEthPriceFeed: "0xb4c4a493AB6356497713A78FFA6c60FB53517c63",
        // This is the LINK token
        daiToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        entranceFee: ethers.utils.parseEther("0.1"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        mintFee: "10000000000000000", // 0.01 ETH
        subscriptionId: "10321",
        callbackGasLimit: "50000",
        interval: "200", //seconds
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit: "50000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
        subscriptionId: "10321", // add your ID here!
    },
    // Due to the different testnets, we are leaving kovan in as a reference
    42: {
        name: "kovan",
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
        wethToken: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
        lendingPoolAddressesProvider: "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
        daiEthPriceFeed: "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541",
        daiToken: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
        callbackGasLimit: "50000",
        mintFee: "10000000000000000", // 0.01 ETH
        interval: "30", //seconds
    },
    80001: {
        name: "polygon Mumbai",
        vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        entranceFee: ethers.utils.parseEther("0.1"),
        gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
        subscriptionId: "3517",
        callbackGasLimit: "50000",
        mintFee: "10000000000000000", // 0.01 ETH
        interval: "30", //seconds
    },
}

const DECIMALS = "18"
const INITIAL_PRICE = "200000000000000000000"
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}
