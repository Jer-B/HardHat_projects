const { getNamedAccounts, ethers } = require("hardhat")
async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding the contract....")

    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("1"),
    })
    await transactionResponse.wait(1)
    console.log("Contract funded !")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
