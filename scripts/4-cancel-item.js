const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function cancelItem() {
    let deployer, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft;

    //////////////////////////
    // tokenId choice
    const TOKEN_ID = 1;
    //////////////////////////

    /// Get accounts
    [deployer] = await ethers.getSigners();
    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(deployer);
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(deployer);
    console.log("CuteNft address:", cuteNft.address);

    // Cancel listing
    const tx = await nftMarketplace.cancelListing(cuteNft.address, TOKEN_ID);
    await tx.wait(1);
    console.log(`NFT canceled: TokenID: ${TOKEN_ID}`);

    // Mining blocks on local network
    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

cancelItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
