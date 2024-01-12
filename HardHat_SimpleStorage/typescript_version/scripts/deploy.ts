//ts version
// import {} from ""
//instead of require
import { ethers, run, network } from "hardhat"

//async main function
async function main() {
    // get account from config network account list, default 0
    const accounts = await ethers.getSigners()
    console.log("print deployer account: ", accounts[0].address.toLowerCase())
    // get balance of that account before deployment
    console.log(
        "print deployer account balance before all transactions: ",
        (await ethers.provider.getBalance(accounts[0].getAddress())).toString()
    )
    /* TEST NETWORKS and account before getting it right
    //check network
    //const network_check = ethers.getNetwork()
    // const checkBalance = await wallet.getBalance().toString()
    //console.log("Wallet balance is: ", (await wallet.getBalance()).toString())
    // or
    //const balance = await ethers.provider.getBalance(owner.address)
    //console.log(balance.toString())
    //console.log("print provider ", ethers.provider)
*/

    // get contract factory of the contract
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )
    console.log("Deploy contract...")

    // wait for the deployment
    const simpleStorage = await SimpleStorageFactory.deploy()
    // make sure it is deployed
    await simpleStorage.deployed()
    console.log("Contract deployed at: ", simpleStorage.address, " !")
    //check network
    console.log("Network infomations: ", network.config)

    //if network match goerly and API key -> verify
    if (network.config.chainId === 5 && process.env.ETHERSCAN_KEY) {
        //before verifying make sure to wait few blocks to be sure that is onchain
        await simpleStorage.deployTransaction.wait(6)

        //verify using contract address and blank args
        await verify(simpleStorage.address, [])
    }

    // interacting with the contract
    const currentValueStored = await simpleStorage.retrieve()
    console.log(
        "Current value stored in the store function of the contract is: ",
        currentValueStored.toString()
    )

    // store a favorite number
    const storeNumber = await simpleStorage.store(29)
    await storeNumber.wait(1)
    // get updated value
    const updatedValue = await simpleStorage.retrieve()
    console.log("New value of store is: ", updatedValue.toString())
    console.log(
        "print account Balance after all transactions: ",
        (await ethers.provider.getBalance(accounts[0].getAddress())).toString()
    )
}

//verify function through etherscan
//async function verify(contractAddress, args) {
// var as a function taking parameters using "=>"
// this is a function not assigned to a variable
//verify = async (contractAddress, args) => {
// all 3 are the same in this case

//Ts version: arguments need to have their type initialized
// string for address and an any "array" for args
const verify = async (contractAddress: string, args: any[]) => {
    console.log("verifying contract...")

    // try / catch process in case a similar contract has already been verified / avoid some errors
    try {
        // verify task + arguments
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e: any) {
        //if verified
        if (e.message.toLowerCase().includes("already verified")) {
            console.log(
                "Contract or similar contract is already verified on etherscan."
            )
        } else {
            console.log(e)
        }
    }
}

// call main function and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
