const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

const TOKEN_ID = 1;
const NEW_PRICE = ethers.utils.parseEther("2");

// Choose NFT to buy (uncomment):
// const basicNftContract = "BasicNft1";
// const basicNftContract = "BasicNft2";
const basicNftContract = "BasicNft3";

async function buyItem() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    basicNft = await ethers.getContract(basicNftContract);
    await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, NEW_PRICE);
    console.log(`NFT price updated! TokenID: ${TOKEN_ID}, NFT address: ${basicNft.address}, New price: ${NEW_PRICE}`);
    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
