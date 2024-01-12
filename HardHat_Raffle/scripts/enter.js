// to be run while lesson 9 and 10 |hh node| and next js server are running
// help to enter raffle with other accounts, fee is 1 eth more higher
// to run it
// yarn hardhat run scripts/enter.js --network localhost
const { ethers } = require("hardhat")

async function enterRaffle() {
    const raffle = await ethers.getContract("Raffle")
    const entranceFee = await raffle.getEntranceFee()
    await raffle.enterRaffle({ value: entranceFee + 1 })
    console.log("Entered!")
}

enterRaffle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
