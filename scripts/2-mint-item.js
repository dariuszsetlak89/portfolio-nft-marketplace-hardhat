const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");

async function mintItem() {
    let deployer, user, nftMarketplaceContract, nftMarketplace, cuteNftContract, cuteNft, randomUriIndex, mintTx, mintTxReceipt;

    // Get accounts
    [deployer, user] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address); // account[0]
    console.log("User address:", user.address); // account[1]

    ////////////////////////////////////////////
    // NFT owner address choice: deployer, user
    const NFT_OWNER = deployer;
    ////////////////////////////////////////////

    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(NFT_OWNER);
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(NFT_OWNER);
    console.log("CuteNft address:", cuteNft.address);

    // Minting
    console.log("Minting NFT...");
    cuteNft = cuteNftContract.connect(NFT_OWNER);
    randomUriIndex = Math.floor(Math.random() * 3);
    mintTx = await cuteNft.mintNft(NFT_OWNER.address, randomUriIndex);
    mintTxReceipt = await mintTx.wait(1);
    const TOKEN_ID = await mintTxReceipt.events[0].args.tokenId;
    console.log("TOKEN_ID:", TOKEN_ID.toString());
    console.log("Minting done.");
    console.log(`NFT minted: TokenID: ${TOKEN_ID}, URI index: ${randomUriIndex}`);

    // Mining blocks on local network
    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

mintItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
