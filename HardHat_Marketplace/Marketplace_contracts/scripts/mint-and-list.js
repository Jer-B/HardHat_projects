const { ethers } = require("hardhat")

const PRICE = ethers.utils.parseEther("0.01")
async function mintAndList() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")

    // mint
    const mintTx = await basicNft.mintNft()
    const mintReceipt = await mintTx.wait(1)

    //get tokenId from event emitted at minting
    const tokenId = mintReceipt.events[0].args.tokenId

    //approve Nft for the marketplace
    const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId)
    await approvalTx.wait(1)

    // listing on the marketplace

    const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    await tx.wait(1)
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
