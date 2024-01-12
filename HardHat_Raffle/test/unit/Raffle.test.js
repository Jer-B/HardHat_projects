/*
Test to do:
- deploy contracts each time if on development chains, if not skip deployments before each test
- initialize raffle correctly: check raffle status
- enter raffle
- fund raffle
- test emits events on enter, winnerpick
*/

const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { assert, expect } = require("chai")

const chainId = network.config.chainId
//if not development chains, skip this part of before each test the need to deploy raffle and mock
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let deployer, raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval

          beforeEach(async function () {
              console.log("Test for Development chains...(local)")
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              console.log("raffle deployed to: ", raffle.address)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              console.log("VRF_V2 deployed to: ", vrfCoordinatorV2Mock.address)
              raffleEntranceFee = await raffle.getEntranceFee()
              console.log("entranceFee is :", raffleEntranceFee.toString(), " eth")
              interval = await raffle.getInterval()
              console.log("Interval is ", interval.toString())
          })

          describe("constructor", function () {
              it("initializes the raffle correctly", async function () {
                  //Ideally 1 assert per "it"
                  const raffleState = await raffle.getRaffleState()
                  const interval = await raffle.getInterval()
                  //0 = open, 1 = calculating
                  console.log("Raffle state: ", raffleState.toString())
                  assert.equal(raffleState.toString(), "0")
                  // interval should equal whatever interval we have set in helper-config
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              }) //constructor describe

              describe("enter raffle", function () {
                  it("revert when you don't pay enough", async function () {
                      //no parameter to enterRaffle for no amount of eth
                      await expect(raffle.enterRaffle()).to.be.revertedWith(
                          "Raffle__NotEnoughEthPaidToEnter"
                      )
                  })
                  it("records player when enter", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      const playerFromContract = await raffle.getPlayers(0) // should be the deployer
                      assert.equal(playerFromContract, deployer)
                      console.log("deployer address: ", deployer)
                      console.log("player address: ", playerFromContract)
                  })
                  it("emits an event on enter", async function () {
                      //contract emit RaffleEnter event when enter the raffle is successfull
                      await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                          raffle,
                          "RaffleEnter"
                      )
                  })
                  it("should revert if raffle is calculating", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      //pretend to be the chainlink keepers to mess the time
                      // using hardhats docs, there is functions for increasing blockchain time and mining method
                      /*
                      evm_increaseTime -> increase timestamp
                      evm_mine -> increase or create new blocks
                      increasing time doesnt do anything if there is no new block mined
                      */

                      //make checkupkeep return true
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      console.log("Interval + 1 is ", (interval.toNumber() + 1).toString())
                      //mine 1 extra block, empty array for default of 1
                      await network.provider.send("evm_mine", [])
                      // can also be done as:
                      //await network.provider.request({method: "evm_mine",params: []})

                      //call performupkeep
                      //pass empty calldata -> empty array
                      await raffle.performUpkeep([])
                      // should be in calculating state
                      //0 = open, 1 = calculating
                      const raffleState = await raffle.getRaffleState()
                      console.log("Raffle state: ", raffleState.toString())
                      await expect(
                          raffle.enterRaffle({ value: raffleEntranceFee })
                      ).to.be.revertedWith("Raffle__NotOpen")
                  })
              }) //enter raffle describe

              describe("checkUpkeep", function () {
                  it("returns false if people haven't sent any ETH", async function () {
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])
                      //callstatic
                      //simulate calling this transacton -> raffle.checkUpkeep([]) which will return the upkeepNeeded and bytes (performData)
                      //await raffle.callStatic.checkUpkeep([])
                      //to get only upkeepNeeded do the following:
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                      //assert not upkeepNeeded(false), which is true
                      console.log("UpkeepNeeded value: ", upkeepNeeded) //false
                      assert(!upkeepNeeded)
                  })
                  it("return false if raffle not open", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])
                      await raffle.performUpkeep([])
                      const raffleState = await raffle.getRaffleState()
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                      //assert not false, which is true
                      console.log("UpkeepNeeded value: ", upkeepNeeded) //false
                      assert.equal(raffleState.toString() == "1", upkeepNeeded == false)
                      //assert.equal(upkeepNeeded == false)
                  })
                  it("returns false if enough time hasn't passed", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
                      await network.provider.send("evm_mine", [])
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                      console.log("UpkeepNeeded value: ", upkeepNeeded) //false
                      assert(!upkeepNeeded)
                  })
                  it("returns true if enough time has passed, has eth, players, is open", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                      console.log("UpkeepNeeded value: ", upkeepNeeded) //true
                      assert(upkeepNeeded)
                  })
              }) //check upkeep function

              describe("perform upkeep", function () {
                  it("only run if checkUpkeep is true", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])
                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                      console.log("UpkeepNeeded value: ", upkeepNeeded) //true
                      const performUpkeep = await raffle.performUpkeep("0x")
                      console.log("performUpkeep tx: ", performUpkeep)
                      // if transaction has run, then it assert it has true
                      assert(performUpkeep)
                  })
                  it("revert if checkupkeep is false", async function () {
                      await expect(raffle.performUpkeep([])).to.be.revertedWith(
                          "Raffle__UpkeepNotNeeded"
                      )
                      /** Here we can be also super specific to test a specific value that it checks
                       *using backsticks  `` and changing variables adapted to the test
                       *await expect(raffle.performUpkeep([])).to.be.revertedWith(
                       *`Raffle__UpkeepNotNeeded(
                       *address(this).balance,
                       *s_players.length,
                       *uint256(s_raffleState)
                       *)`
                       *)
                       */
                  })
                  it("updates the raffle state and emits a requestId", async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])

                      const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")

                      const performUpkeep = await raffle.performUpkeep("0x")
                      const txReceipt = await performUpkeep.wait(1) // waits 1 block

                      const raffleState = await raffle.getRaffleState()
                      console.log("Raffle state: ", raffleState.toString())

                      const requestId = txReceipt.events[1].args.requestId

                      //console.log("UpkeepNeeded value: ", upkeepNeeded) //true
                      //console.log("performUpkeep tx: ", performUpkeep) // tx going through
                      console.log("requestId value: ", requestId.toString()) //1
                      //requestId should be greater than 0, number of request numbers, state should be calculating
                      assert(requestId.toNumber() > 0)
                      assert(raffleState == 1) // 0 = open, 1 = calculating
                  })
              }) //perform upkeep function

              describe("fulfillRandomWords", function () {
                  //before each call to fulfillRandomWords, we need to have checkupkeep and performupkeep pass
                  //in other words, we need to make in sort that someone entered the raffle already (the deployer)
                  beforeEach(async function () {
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.request({ method: "evm_mine", params: [] })
                  })
                  it("can only be called after performupkeep", async function () {
                      //calling inside VRF the random number verification passing to it a
                      //request number, the requestId and an address, the consumer adress.
                      //which is the raffle contract address

                      await expect(
                          vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address) // reverts if not fulfilled
                      ).to.be.revertedWith("nonexistent request")
                      await expect(
                          vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address) // reverts if not fulfilled
                      ).to.be.revertedWith("nonexistent request")
                  })

                  // This test is too big...
                  // This test simulates users entering the raffle and wraps the entire functionality of the raffle
                  // inside a promise that will resolve if everything is successful.
                  // An event listener for the WinnerPicked is set up
                  // Mocks of chainlink keepers and vrf coordinator are used to kickoff this winnerPicked event
                  // All the assertions are done once the WinnerPicked event is fired
                  it("picks a winner, resets, and sends money", async function () {
                      //add additional players
                      const additionalEntrances = 3
                      // will go through a for loop starting from deployer account, the first one
                      const startingAccountIndex = 2
                      const accounts = await ethers.getSigners()
                      for (
                          let i = startingAccountIndex;
                          i < startingAccountIndex + additionalEntrances;
                          i++
                      ) {
                          // add additional accounts to the raffle
                          const accountConnectedRaffle = raffle.connect(accounts[i])
                          await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
                      }
                      //keep track of timestamp
                      const startingTimeStamp = await raffle.getLastTimeStamp()

                      // from here in order
                      /**
                       * run performUpkeep (with mock and simulate being the chainlink keeper)
                       * kickoff fulfillRandomWords (with mock being the chainlink VRF)
                       * --on testnet after we will have to wait for fulfillRandomWords to be called
                       * --on local chain we dont have to wait, we can simulate that we do need to wait the call
                       * in order to simulate waiting for the calling event we can
                       * set up a listener listening to the call event
                       * remember if we need to setup a listener, the test will finish before
                       * being able to listen for the event in the right order. So we need to put in place
                       * a new Promise.
                       * like we did in the FundMe fullstack version for HTML/JS/Contract call by users
                       * to make sure a transaction happened
                       * THIS PROMISES STRUCTURE WILL BE IMPORTANT FOR THE STAGING TEST
                       * its gonna look a bit doing things backwards because
                       * we need the listener first, before calling performUpkeep
                       */
                      await new Promise(async function (resolve, reject) {
                          //listen for the WinnerPicked event, once it happens, do stuff
                          raffle.once("winnerPicked", async function () {
                              //listener is activated and waiting to fire after performupkeep

                              //we want it also be able to reject.
                              //add a timeout for mocha in hardhat.config
                              //if event doesnt fire 200seconds after starting to listen for the event to happen
                              // it reject
                              //----------------
                              //once it catched the event winnerPicked
                              //after the fulfillRandomWords function has been called
                              console.log("WinnerPicked event catched !")
                              try {
                                  //get the last winner, rafflestate, lasttimestamp
                                  const recentWinner = await raffle.getRecentWinner()
                                  console.log("winner is account: ", recentWinner)
                                  const raffleState = await raffle.getRaffleState()
                                  console.log("Raffle state value is: ", raffleState)

                                  const endingBalance0 = await accounts[0].getBalance()
                                  const endingBalance1 = await accounts[1].getBalance()
                                  const endingBalance2 = await accounts[2].getBalance()
                                  const endingBalance3 = await accounts[3].getBalance()

                                  console.log(
                                      "Accounts deployer: ",
                                      accounts[0].address,
                                      "starting balance: ",
                                      startingBalance0.toString(),
                                      "ending balance: ",
                                      endingBalance0.toString()
                                  )
                                  console.log(
                                      "Accounts simulation 1: ",
                                      accounts[1].address,
                                      "starting balance: ",
                                      startingBalance1.toString(),
                                      "ending balance: ",
                                      endingBalance1.toString()
                                  )
                                  console.log(
                                      "Accounts simulation 2: ",
                                      accounts[2].address,
                                      "starting balance: ",
                                      startingBalance2.toString(),
                                      "ending balance: ",
                                      endingBalance2.toString()
                                  )
                                  console.log(
                                      "Accounts simulation 3: ",
                                      accounts[3].address,
                                      "starting balance: ",
                                      startingBalance3.toString(),
                                      "ending balance: ",
                                      endingBalance3.toString()
                                  )

                                  const endingTimeStamp = await raffle.getLastTimeStamp()
                                  console.log("Last block value is: ", endingTimeStamp.toString())

                                  //when a winner is picked, player array should be reset to 0
                                  const numPlayers = await raffle.getNumberOfPlayers()
                                  console.log("Players array: ", numPlayers.toString())
                                  assert.equal(numPlayers.toString(), "0")
                                  //or
                                  //await expect(raffle.getPlayers(0)).to.be.reverted

                                  //raffle state should be back to open, 0
                                  assert.equal(raffleState.toString(), "0")

                                  //last block should be greater than starting block
                                  assert(endingTimeStamp > startingTimeStamp)

                                  // Balance Comparisons and winner check
                                  assert.equal(recentWinner.toString(), accounts[2].address)
                                  assert.equal(
                                      endingBalance2.toString(),
                                      startingBalance2 // startingBalance + ( (raffleEntranceFee * additionalEntrances) + raffleEntranceFee )
                                          .add(
                                              raffleEntranceFee
                                                  .mul(additionalEntrances)
                                                  .add(raffleEntranceFee)
                                          )
                                          .toString()
                                  )
                                  // if went well resolve
                                  resolve()
                              } catch (e) {
                                  //if event doesnt fire 200seconds after starting to listen for the event to happen
                                  // the promise will reject
                                  reject(e)
                              }
                          })
                          //outside of the listener
                          //fire the event, listener will pick it up and resolve
                          //mocking chainlink keepers
                          const tx = await raffle.performUpkeep([])
                          const txReceipt = await tx.wait(1)

                          //setup check on balances of the winner
                          const startingBalance0 = await accounts[0].getBalance()
                          const startingBalance1 = await accounts[1].getBalance()
                          const startingBalance2 = await accounts[2].getBalance()
                          const startingBalance3 = await accounts[3].getBalance()

                          //mocking chainlink VRF
                          //calling inside VRF the random number verification ->fulfillRandomWords()
                          //passing to it a request number, the requestId
                          //and an address, the consumer adress.
                          //which is the raffle contract address
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              txReceipt.events[1].args.requestId,
                              raffle.address
                          )
                          //after this function fulfillRandomWords is being called,
                          //winnerPicked event starts
                      })
                  })
              }) //fulfillRandomWords function
          }) // beforeEach parenthesis
      }) //if development chain parenthesis
