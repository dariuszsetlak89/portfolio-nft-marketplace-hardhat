const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function cancelItem() {
    let deployer, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft, cancelTx;

    /// Get accounts
    [deployer, user] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address); // account[0]
    console.log("User address:", user.address); // account[1]

    ////////////////////////////////////////////
    // NFT owner address choice: deployer, user
    const NFT_OWNER = deployer;
    ////////////////////////////////////////////

    /////////////////////////////
    // tokenId of NFT for cancel:
    const TOKEN_ID = 1;
    /////////////////////////////

    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(NFT_OWNER);
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(NFT_OWNER);
    console.log("CuteNft address:", cuteNft.address);

    // Cancel listing
    console.log("Canceling...");
    cancelTx = await nftMarketplace.cancelListing(cuteNft.address, TOKEN_ID);
    await cancelTx.wait(1);
    console.log(`NFT canceled: TokenID: ${TOKEN_ID}`);
    console.log("Canceling done.");

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
