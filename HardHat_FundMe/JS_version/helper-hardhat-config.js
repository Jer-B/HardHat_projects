const networkConfig = {
    //network chain id, and corresponding pricefeed address
    31337: {
        name: "localhost",
    },
    5: {
        name: "Goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    80001: {
        name: "polygon Mumbai",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    },
}

//networks without pricefeed addresses. development networks
const developmentChains = ["hardhat", "localhost"]
// mockv3aggregator constructor use a DECIMALS function of 8 and an INITIAL_ANSWER which
// correspond at what price it will start from, we need both in same order
const DECIMALS = 8
//with 8 decimals
const INITIAL_ANSWER = 169000000000

//export this config to have other scripts to be able to work with it

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
