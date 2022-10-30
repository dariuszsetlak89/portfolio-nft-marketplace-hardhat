const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { moveBlocks } = require("../utils/move-blocks");

async function mintAndListItem() {
    let deployer,
        nftMarketplaceContract,
        nftMarketplace,
        cuteNftContract,
        cuteNft,
        listingPriceChoice,
        listingPrice,
        randomUriIndex,
        mintTx,
        mintTxReceipt,
        approvalTx,
        listTx;

    // Get accounts
    [deployer] = await ethers.getSigners();
    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(deployer);
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(deployer);
    console.log("CuteNft address:", cuteNft.address);

    // Listing price
    const FIXED_PRICE = ethers.utils.parseEther("1");

    ///////////////////////////////////////
    // Listing price choice: FIXED, RANDOM
    listingPriceChoice = "RANDOM";
    ///////////////////////////////////////

    //////////////////////////
    // Number of items choice
    const NUMBER_OF_ITEMS = 3;
    //////////////////////////

    for (let i = 1; i <= NUMBER_OF_ITEMS; i++) {
        // Minting
        cuteNft = cuteNftContract.connect(deployer);
        randomUriIndex = Math.floor(Math.random() * 3);
        mintTx = await cuteNft.mintNft(deployer.address, randomUriIndex);
        mintTxReceipt = await mintTx.wait(1);
        const TOKEN_ID = mintTxReceipt.events[0].args.tokenId;

        // Approving
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        approvalTx = await cuteNft.approve(nftMarketplace.address, TOKEN_ID.toString());
        await approvalTx.wait(1);

        // Listing price
        if (listingPriceChoice == "FIXED") listingPrice = FIXED_PRICE;
        else if (listingPriceChoice == "RANDOM") {
            const RANDOM_PRICE = ethers.utils.parseEther(Math.floor(Math.random() * 100 + 1).toString());
            listingPrice = RANDOM_PRICE;
        } else console.log("Wrong choice!");

        // Listing
        listTx = await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, listingPrice);
        await listTx.wait(1);
        console.log(
            `NFT minted, approved and listed: TokenID: ${TOKEN_ID}, URI index: ${randomUriIndex}, Listing price: ${ethers.utils.formatEther(
                listingPrice
            )} ETH`
        );
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
