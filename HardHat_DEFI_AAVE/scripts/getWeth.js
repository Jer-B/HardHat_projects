const { getNamedAccounts, ethers, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
// constants
const AMOUNT = ethers.utils.parseEther("0.02")

async function getWeth() {
    //first we need an account
    const { deployer } = await getNamedAccounts()

    //then call the deposit function on the Weth contract
    // so -> abi, and contract address
    // to get the ABI, grab the interface of IWETH and then compile it
    // for now will use the mainnet adress of Weth for reasons that will be explained soon
    // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    // under is the real goerli address to test out contract through etherscan
    // 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6

    //getContractAt get a contract at specific address, while spcifying the ABI to use
    // and connect it to the provider -> deployer
    // so the compiled ABI from interface, adress from mainnet, the deployer
    const iWeth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        deployer
    )
    // Moduralized version:

    // const iWeth = await ethers.getContractAt(
    //     "IWeth",
    //     networkConfig[network.config.chainId].wethToken,
    //     deployer
    // )

    // The reason why we are using the mainnet contract, is because there is another way
    //to test our contracts. It is by forking the mainnet into a local chain

    //deposit 0.02
    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)

    //get our wallet balance on the iweth ERC20 token contract function
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Weth balance : ${wethBalance.toString()} WETH`)
}

module.exports = { getWeth, AMOUNT }
