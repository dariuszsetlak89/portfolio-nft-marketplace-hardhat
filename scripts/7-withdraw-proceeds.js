const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function withdrawProceeds() {
    let deployer, nftMarketplaceContract, nftMarketplace, sellerBalanceBefore, withdrawalTx, sellerBalanceAfter, withdrawalAmount;

    // Get accounts
    [deployer, user] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address); // account[0]
    console.log("User address:", user.address); // account[1]

    ////////////////////////////////////////////
    // Seller address choice: deployer, user
    const SELLER = deployer;
    ////////////////////////////////////////////

    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(SELLER);

    // Proceeds withdrawal
    sellerBalanceBefore = await SELLER.getBalance();
    console.log("Seller balance before withdrawal:", ethers.utils.formatEther(sellerBalanceBefore));
    withdrawalTx = await nftMarketplace.withdrawProceeds();
    await withdrawalTx.wait(1);
    sellerBalanceAfter = await deployer.getBalance();
    console.log("Seller balance after withdrawal:", ethers.utils.formatEther(sellerBalanceAfter));
    withdrawalAmount = ethers.utils.formatEther(await sellerBalanceAfter.sub(sellerBalanceBefore));
    console.log(`Proceeds withdrawal success! Withdrawal amount: ${withdrawalAmount}`);

    // Mining blocks on local network
    if (developmentChains.includes(network.name)) {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

withdrawProceeds()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
