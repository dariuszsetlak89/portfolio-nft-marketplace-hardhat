const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");

async function mintAndListItem() {
    let deployer,
        user,
        nftMarketplaceContract,
        nftMarketplace,
        cuteNftContract,
        cuteNft,
        uriIndex,
        mintTx,
        mintTxReceipt,
        approvalTx,
        listTx;

    // Get accounts
    deployer = (await ethers.getSigners())[0];
    // user = (await ethers.getSigners())[1];
    // console.log("Deployer address:", deployer.address); // account[0]
    // console.log("User address:", user.address); // account[1]

    //////////////////////////////////////////////////////
    // Listing price choice:
    const LISTING_PRICE = ethers.utils.parseEther("0.1");
    //////////////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // NFT owner address choice: deployer, user
    const NFT_OWNER = deployer;
    //////////////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // Number of NFT items to mint and list
    const nftAmount = 3;
    //////////////////////////////////////////////////////

    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(NFT_OWNER);
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(NFT_OWNER);
    // console.log("CuteNft address:", cuteNft.address);

    for (let i = 0; i < nftAmount; i++) {
        // Minting
        console.log("Minting NFT...");
        cuteNft = cuteNftContract.connect(NFT_OWNER);
        // uriIndex = Math.floor(Math.random() * 3);
        uriIndex = i;
        mintTx = await cuteNft.mintNft(NFT_OWNER.address, uriIndex);
        mintTxReceipt = await mintTx.wait(1);
        const TOKEN_ID = await mintTxReceipt.events[0].args.tokenId;
        console.log("TOKEN_ID:", TOKEN_ID.toString());
        console.log("Minting done.");

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
            `NFT minted, approved and listed: TokenID: ${TOKEN_ID}, URI index: ${uriIndex}, Listing price: ${ethers.utils.formatEther(
                LISTING_PRICE
            )} ETH`
        );

        // Mining blocks on local network
        if (developmentChains.includes(network.name)) {
            await moveBlocks(1, (sleepAmount = 1000));
        }
    }
}

mintAndListItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
