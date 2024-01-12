const { getNamedAccounts, deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          // const for sending value when funding the contract
          //const sendValue = "1000000000000000000"
          //
          //can be written differently by using ethers utilities
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              //deploy smartcontract by using Hardhat-deploy

              //get the deployer, extract just it from getNamedAccounts
              deployer = (await getNamedAccounts()).deployer
              console.log("print deployer ", deployer)
              // other way to get accounts is to use ethers.getSigners()
              // const accounts = await ethers.getSigners()
              // const first_account = accounts[0]

              //deployments has a fixture that allows us to use any amount of tags we want
              // and in one line we can select what to deploy from our deploy folders
              await deployments.fixture(["all"])
              // console.log("print fixture", await deployments.fixture(["all"]))

              //once it's deployed get most recent fundMe contract
              fundMe = await ethers.getContract("FundMe", deployer)
              console.log("print fundme", fundMe)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
              console.log("print MockV3Aggregator ", mockV3Aggregator)
          })
          // test the constructor
          describe("constructor", async function () {
              it("Set the aggregator addresses correctly", async function () {
                  const response = await fundMe.priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          //test fallback and receive
          // describe("fallback and receive", async function () {})

          //test fund function
          //- if enough eth sent and not enough eth to sent
          //- if funding goes right, contract balance should change from 0 to 0.1 let say
          describe("fund", async function () {
              // require line checking eth amount to sent
              it("Fail if not enough eth sent", async function () {
                  // expect from waffle, is how to test something that should fail
                  // chai gets overwritten by waffle, the doc contains many more other
                  // stuff for proper test
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Not sufficient amount for funding, 1 eth minimum."
                  )
              })

              // should update the amount funded data-tructure
              it("updates the amount funded data-structure", async function () {
                  //- need a value to be passed to fund me
                  //- need to check the amount of eth in the contract

                  await fundMe.fund({ value: sendValue })

                  const response = await fundMe.addressToAmountFunded(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })

              // should add funder to the funders array after funding
              it("Should add deployer to array of funders", async function () {
                  // check the funder array
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.funders(0)
                  assert.equal(funder, deployer)
              })
          })

          // withdraw function test
          // - check that onlyowner can withdraw
          // - reset array after withdraw should be empty
          // - balance change after withdraw
          // for each test in withdraw we need to fund the contract to be able to withdraw
          // so lets put another beforeEach inside.

          // since it is gonna be a longer test. divide it in 3 parts:
          /**
           * Arrange:
           * Act:
           * Assert: check final result
           */
          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("Should withdraw eth from a single funder, only the owner can", async function () {
                  //Arrange
                  // check if we are actually withdrawing. checking balance change
                  // starting balances of deployer and contract
                  const deployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const fundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  //Act
                  // run the withdraw function
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  // to get the gas amount it cost we use transaction receipt.
                  // and use a break point on this line
                  // which then lead us to the need of using the debugger tool from VS code, to see the code stop at this point
                  // and be able to examine above variables to see the cost of the gas price.

                  // note bug with WSL. tried to open JS debugger then WSL into it and run yarn hardhat test. doesnt work.
                  // try from cmd in the folder to do just yarn. I broke everything.
                  // debugger doesnt attached.
                  // install yarn first from windows and everything else can be better for being able to use debugger

                  // anyway in the debug console (if it works) we can type transactionReceipt and it brings us to those lines
                  // where we can see the transaction details
                  // there is an effectiveGasPrice and gasUsed parts.
                  // gasUsed * effectiveGasPrice = the amount of gas we paid for the transaction

                  // can pull them directly from transactionReceipt like this:
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  // then call them to calculate gasCost -> mul() function to multiply bignumbers
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const fundMeBalanceAfter = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const deployerBalanceAfter = await fundMe.provider.getBalance(
                      deployer
                  )

                  //Assert
                  // check equality and expectation
                  // fundMe balance should be 0
                  assert.equal(fundMeBalanceAfter, 0)
                  // the balance of deployer should be equal to the amount funded and the amount of deployer at the amount of the withdrawing
                  // since we are working with bignumbers, instead of + we use add()
                  // viewing amount use view functions but when we withdraw it is a payable function.
                  // so we are making a transaction to be able to withdraw. which cost gas.
                  // we must include that gas amount else result won't be accurate at all
                  assert.equal(
                      fundMeBalance.add(deployerBalance).toString(),
                      deployerBalanceAfter.add(gasCost).toString()
                  )
              })
              it("allows us to withdraw with multiple funders", async function () {
                  //Arrange

                  // grab the default list accounts and loop through it to test them all
                  const accounts = await ethers.getSigners()
                  // start from 1 because 0 is the deployer
                  for (let i = 1; i < 6; i++) {
                      // when using other accounts than default at same time as default
                      // we need to use connect to get them all online
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      // fund the contract with each accounts
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const deployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const fundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  assert.equal(
                      fundMeBalance.add(deployerBalance).toString(),
                      deployerBalanceAfter.add(gasCost).toString()
                  )

                  // Make sure the arrays of funder gets reset properly
                  await expect(fundMe.funders(0)).to.be.reverted

                  // then loop through each accounts in the mapping to make sure of it
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              // test only owner withdrawing, using an attacker accounts too
              it("Only owner should be able to withdraw", async function () {
                  // attacker account
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  // connect attacker
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  // expect it should be reverted with our custom error to know from where it get reverted
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })
      })
