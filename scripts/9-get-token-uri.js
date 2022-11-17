const { ethers } = require("hardhat");

async function getTokenUri() {
    let deployer, cuteNftContract, cuteNft, tokenUri;

    /// Get accounts
    [deployer, user] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address); // account[0]
    // console.log("User address:", user.address); // account[1]

    /////////////////////////////
    // tokenId of the NFT:
    const TOKEN_ID = 2;
    /////////////////////////////

    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(deployer);
    console.log("CuteNft address:", cuteNft.address);

    // Get token URI
    console.log("Get tokenURI...");
    tokenUri = await cuteNft.tokenURI(TOKEN_ID);
    console.log(`NFT tokenURI fetched: TokenID: ${TOKEN_ID}, TokenURI: ${tokenUri}`);
    console.log("Get tokenURI done.");
}

getTokenUri()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
