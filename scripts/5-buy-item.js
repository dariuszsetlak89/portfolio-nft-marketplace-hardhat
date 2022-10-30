const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function buyItem() {
    let deployer, user, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft, listing, buyPrice, buyTx;

    //////////////////////////
    // tokenId choice
    const TOKEN_ID = 0;
    //////////////////////////

    // Get accounts
    [deployer, user] = await ethers.getSigners();
    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(user);
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(deployer);
    console.log("CuteNft address:", cuteNft.address);

    // Buy listed item
    listing = await nftMarketplace.getListing(cuteNft.address, TOKEN_ID);
    buyPrice = listing.price;
    buyTx = await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: buyPrice });
    await buyTx.wait(1);
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
