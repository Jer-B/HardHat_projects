const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")

const chainId = network.config.chainId
//if not development chains, skip this part of before each test the need to deploy raffle and mock
developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle staging Tests", function () {
          let deployer, raffle, raffleEntranceFee

          beforeEach(async function () {
              console.log("Test for testnet")
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              console.log("raffle deployed to: ", raffle.address)
              raffleEntranceFee = await raffle.getEntranceFee()
              console.log("entranceFee is :", raffleEntranceFee.toString(), " eth")
          })
          describe("fulfillRandomWords", function () {
              it("Works with chainlink keepers and VRF and pick-return winner", async function () {
                  //enter the raffle
                  const startingTimeStamp = await raffle.getLastTimeStamp()
                  const accounts = await ethers.getSigners()
                  //setup listener before entering the raffle
                  // in case the blockchain moves really fast(lol)
                  await new Promise(async (resolve, reject) => {
                      raffle.once("winnerPicked", async function () {
                          console.log("winner picked, event fired!")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              console.log("recent winner is: ", recentWinner.toString())
                              const raffleState = await raffle.getRaffleState()
                              console.log("Raffle state is: ", raffleState.toString())
                              const winnerBalance = await accounts[0].getBalance()
                              console.log("winner balance is: ", winnerBalance.toString())
                              const endingTimeStamp = await raffle.getLastTimeStamp()

                              //players arrays to be 0
                              //console.log("expect array to be reverted. OK")
                              await expect(raffle.getPlayers(0)).to.be.reverted

                              //console.log("expect rafflestate to be 0. OK")
                              assert.equal(raffleState, 0)
                              //console.log("expect winner to be deployer. OK")
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(
                                  winnerBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(e)
                          }
                      })
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(1)
                      const winnerStartingBalance = await accounts[0].getBalance()
                      //console.log("winner starting balance is: ", winnerStartingBalance.toString())
                  })
              })
          })
      })
