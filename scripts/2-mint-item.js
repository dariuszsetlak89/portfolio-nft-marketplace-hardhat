const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");

async function mintAndListItem() {
    let deployer, cuteNftContract, cuteNft, randomUriIndex, mintTx, mintTxReceipt;

    // Get accounts
    [deployer] = await ethers.getSigners();
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(deployer);
    console.log("CuteNft address:", cuteNft.address);

    //////////////////////////
    // Number of items choice
    const NUMBER_OF_ITEMS = 1;
    //////////////////////////

    for (let i = 1; i <= NUMBER_OF_ITEMS; i++) {
        randomUriIndex = Math.floor(Math.random() * 3);
        // Minting
        mintTx = await cuteNft.mintNft(deployer.address, randomUriIndex);
        mintTxReceipt = await mintTx.wait(1);
        const TOKEN_ID = mintTxReceipt.events[0].args.tokenId;
        console.log(`NFT minted: TokenID: ${TOKEN_ID}, URI index: ${randomUriIndex}`);
    }

    // Mining blocks on local network
    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

mintAndListItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
