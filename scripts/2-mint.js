const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");

const NUMBER_OF_ITEMS = 1;

async function mintAndList() {
    for (let i = 1; i <= NUMBER_OF_ITEMS; i++) {
        const randomNumber = Math.floor(Math.random() * 3) + 1;
        // console.log(randomNumber);
        let basicNft, randomChosenNFT;
        switch (randomNumber) {
            case 1: {
                basicNft = await ethers.getContract("BasicNft1");
                randomChosenNFT = "Pug";
                break;
            }
            case 2: {
                basicNft = await ethers.getContract("BasicNft2");
                randomChosenNFT = "Shiba Inu";
                break;
            }
            case 3: {
                basicNft = await ethers.getContract("BasicNft3");
                randomChosenNFT = "St. Bernard";
                break;
            }
            default:
                console.log("Error! No matching contract.");
        }

        // Minting
        console.log("Minting NFT...");
        const mintTx = await basicNft.mintNft();
        const mintTxReceipt = await mintTx.wait(1);
        const tokenId = mintTxReceipt.events[0].args.tokenId;
        console.log(`NFT minted!`);
        console.log(`Minted NFT: ${randomChosenNFT}, TokenID: ${tokenId}, NFT address: ${basicNft.address}`);

        // Mining blocks on local network
        if (developmentChains.includes(network.name)) {
            // Moralis has a hard time if you move more than 1 at once!
            await moveBlocks(1, (sleepAmount = 1000));
        }
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
