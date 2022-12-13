const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function updateListingPrice() {
    let deployer, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft, updateTx;

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
    const TOKEN_ID = 2;
    /////////////////////////////

    ////////////////////////////////////////////////
    // Updated price choice
    const NEW_PRICE = ethers.utils.parseEther("0.2");
    ////////////////////////////////////////////////

    // Get contracts
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(NFT_OWNER);
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(NFT_OWNER);
    console.log("CuteNft address:", cuteNft.address);

    // Update listing price
    console.log("Updating listing price...");
    updateTx = await nftMarketplace.updateListing(cuteNft.address, TOKEN_ID, NEW_PRICE);
    await updateTx.wait(1);
    console.log("Listing price updated.");
    console.log(
        `NFT price updated: TokenID: ${TOKEN_ID}, New price: ${ethers.utils.formatEther(NEW_PRICE.toString())} ETH`
    );

    // Mining blocks on local network
    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

updateListingPrice()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
