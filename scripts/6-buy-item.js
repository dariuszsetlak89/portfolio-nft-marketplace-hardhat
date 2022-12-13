const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function buyItem() {
    let deployer, user, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft, listing, buyPrice, buyTx;

    // Get accounts
    [deployer, user] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address); // account[0]
    console.log("User address:", user.address); // account[1]

    ////////////////////////////////////////////
    // NFT owner address choice: deployer, user
    const NFT_BUYER = user;
    ////////////////////////////////////////////

    /////////////////////////////
    // tokenId of NFT for buy:
    const TOKEN_ID = 2;
    /////////////////////////////

    // Get contracts
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(NFT_BUYER);
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(NFT_BUYER);
    console.log("CuteNft address:", cuteNft.address);

    // Buy listed item
    console.log("Buying...");
    listing = await nftMarketplace.getListing(cuteNft.address, TOKEN_ID);
    buyPrice = listing.price;
    buyTx = await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: buyPrice });
    await buyTx.wait(1);
    console.log("Buying done.");
    console.log(`NFT bought: TokenID: ${TOKEN_ID}, Buy price: ${ethers.utils.formatEther(buyPrice)} ETH`);

    // Mining blocks on local network
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
