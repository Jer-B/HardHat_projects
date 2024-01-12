// to create a task require to import task functions first
const { task } = require("hardhat/config")

// takes a task name and a description
task(
    "block-number",
    "Print the current block number of the selected chain"
).setAction(
    //task can do 2 things. Take parameters with .addParam or take action with .setAction
    // define a function of 2 arguments not assigned to a variable by using =>

    // can be imagined like
    // const blockTask = async function(taskArgs, hre) => {}
    // or
    // async function blockTask(taskArgs, hre){}

    // this under is known as an anonymous function because it doesnt have a name
    async (taskArgs, hre) => {
        //hre object is the HardHat Runtime Environment
        // basically is like saying require("hardhat") to be able to access same packages
        const blockNumber = await hre.ethers.provider.getBlockNumber()
        console.log("Current block number of this chain is, ", blockNumber)
    }
    // for this task to show up when using yarn hardhat, it needs to be added to the hardhat.config.js
    // require("./tasks/block-number")

    // how to use:
    // yarn hardhat blocknumber
    // returns default chain block number
    // ie: return result is -> 0

    // yarn hardhat blocknumber --network alchemy_goerly
    // returns selected network chain block number
    // ie: return result is -> 8395979

    // adding modules

    //module.exports = {}
)
