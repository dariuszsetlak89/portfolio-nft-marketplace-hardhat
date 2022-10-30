const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function updateListingPrice() {
    let deployer, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft, updateTx;

    //////////////////////////
    // tokenId choice
    const TOKEN_ID = 0;
    //////////////////////////

    ////////////////////////////////////////////////
    // Updated price choice
    const NEW_PRICE = ethers.utils.parseEther("33");
    ////////////////////////////////////////////////

    /// Get accounts
    [deployer] = await ethers.getSigners();
    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(deployer);
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(deployer);
    console.log("CuteNft address:", cuteNft.address);

    // Update listing price
    updateTx = await nftMarketplace.updateListing(cuteNft.address, TOKEN_ID, NEW_PRICE);
    await updateTx.wait(1);
    console.log(`NFT price updated: TokenID: ${TOKEN_ID}, New price: ${ethers.utils.formatEther(NEW_PRICE.toString())} ETH`);

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
