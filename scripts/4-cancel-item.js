const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function cancelItem() {
    let deployer, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft, cancelTx;

    /// Get signers
    [deployer, user] = await ethers.getSigners();

    ////////////////////////////////////////////
    // NFT owner address choice: deployer, user
    const NFT_OWNER = deployer;
    ////////////////////////////////////////////

    /////////////////////////////
    // tokenId of NFT for cancel:
    const TOKEN_ID = 0;
    /////////////////////////////

    // Get contracts
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(NFT_OWNER);
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
