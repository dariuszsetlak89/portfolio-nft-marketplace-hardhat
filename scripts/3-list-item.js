const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");

async function listItem() {
    let deployer, user, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft, approvalTx, listTx;

    // Get accounts
    [deployer, user] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address); // account[0]
    console.log("User address:", user.address); // account[1]

    //////////////////////////////////////////////////////
    // Listing price choice:
    const LISTING_PRICE = ethers.utils.parseEther("0.1");
    //////////////////////////////////////////////////////

    ////////////////////////////////////////////
    // NFT owner address choice: deployer, user
    const NFT_OWNER = deployer;
    ////////////////////////////////////////////

    //////////////////////////////
    // tokenId of NFT for listing:
    const TOKEN_ID = 1;
    //////////////////////////////

    // Get contracts
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(NFT_OWNER);
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(NFT_OWNER);
    console.log("CuteNft address:", cuteNft.address);

    // Approving
    console.log("Approving...");
    nftMarketplace = nftMarketplaceContract.connect(NFT_OWNER);
    approvalTx = await cuteNft.approve(nftMarketplace.address, TOKEN_ID);
    await approvalTx.wait(1);
    console.log("Approving done.");

    // Listing
    console.log("Listing NFT...");
    listTx = await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, LISTING_PRICE);
    await listTx.wait(1);
    console.log("Listing done.");
    console.log(
        `NFT approved and listed: TokenID: ${TOKEN_ID}, Listing price: ${ethers.utils.formatEther(LISTING_PRICE)} ETH`
    );

    // Mining blocks on local network
    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

listItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
