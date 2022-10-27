const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

const TOKEN_ID = 1;

// Choose NFT to buy (uncomment):
// const basicNftContract = "BasicNft1";
// const basicNftContract = "BasicNft2";
const basicNftContract = "BasicNft3";

let deployer, user;

async function buyItem() {
    [deployer, user] = await ethers.getSigners();
    const nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(user);
    basicNft = await ethers.getContract(basicNftContract);
    const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
    const price = listing.price;
    const tx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price });
    await tx.wait(1);
    console.log(`NFT Bought! TokenID: ${TOKEN_ID}, NFT address: ${basicNft.address}, NFT price: ${price}`);
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
