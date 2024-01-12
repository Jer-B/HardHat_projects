const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft Test", function () {
          beforeEach(async function () {
              const accounts = await getNamedAccounts()
              deployer = accounts.deployer
              //deployer = accounts[0]

              await deployments.fixture("Basicnft")
              basicNft = await ethers.getContract("BasicNft", deployer)
          })
          it("Can be deployed", async () => {
              //contract on 2nd block on hardhat node -> 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
              console.log("basic NFT address: ", basicNft.address)
              assert(basicNft.address)
          })

          // test constructor
          describe("Constructor Test", function () {
              it("Should have a name, symbol and tokenId", async () => {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  const tokenId = await basicNft.getTokenCounter()

                  // output
                  console.log("Nft Name: ", name)
                  console.log("Nft Symbol: ", symbol)
                  // no mint done yet so should be 0
                  console.log("TokenId : ", tokenId.toString())

                  // verify result
                  assert.equal(name, "Dogie")
                  assert.equal(symbol, "DOG")
                  assert.equal(tokenId.toString(), "0")
              })
          })

          // test minting an Nft and verify TokenId incrementation
          describe("Minting Test", function () {
              //mint before each test
              beforeEach(async () => {
                  const mint = await basicNft.mintNft()
                  await mint.wait(1)
              })
              it("Should be able to mint an NFT, and tokenId to be 1", async () => {
                  const tokenURI = await basicNft.tokenURI(0)
                  const tokenId = await basicNft.getTokenCounter()

                  // token URI update
                  console.log("TokenURI update at index 0: ", tokenURI)

                  // if Minting goes well should be 1
                  console.log("TokenId : ", tokenId.toString())

                  //verifying result
                  assert.equal(tokenId.toString(), "1")
                  //tokenURI at index 0 should equal the constant variable value
                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
              })

              // owner balance check
              it("Shows correct balance and the owner of an NFT", async () => {
                  const deployerAddress = deployer
                  const deployerBalance = await basicNft.balanceOf(deployer)
                  // owner of tokenId index 0
                  const owner = await basicNft.ownerOf("0")

                  console.log("Deployer address: ", deployerAddress)
                  console.log("Deployer Balance: ", deployerBalance.toString())
                  console.log("Owner of tokenId number 0: ", owner)

                  assert.equal(deployerBalance.toString(), "1")
                  assert.equal(owner, deployerAddress)
              })
          })
      })
