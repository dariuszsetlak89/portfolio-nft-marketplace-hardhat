const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const { developmentChains } = require("../helper-hardhat-config");

async function withdrawProceeds() {
    let deployer,
        nftMarketplaceContract,
        nftMarketplace,
        cuteNftContract,
        cuteNft,
        deployerBalanceBefore,
        withdrawalTx,
        deployerBalanceAfter,
        withdrawalAmount;

    // Get accounts
    [deployer] = await ethers.getSigners();
    // Get contract: nftMarketplace
    nftMarketplaceContract = await ethers.getContract("NftMarketplace");
    nftMarketplace = nftMarketplaceContract.connect(deployer);
    // Get contract: CuteNft
    cuteNftContract = await ethers.getContract("CuteNft");
    cuteNft = cuteNftContract.connect(deployer);
    console.log("CuteNft address:", cuteNft.address);

    // Proceeds withdrawal
    deployerBalanceBefore = await deployer.getBalance();
    console.log("Deployer balance before withdrawal:", ethers.utils.formatEther(deployerBalanceBefore));
    withdrawalTx = await nftMarketplace.withdrawProceeds();
    await withdrawalTx.wait(1);
    deployerBalanceAfter = await deployer.getBalance();
    console.log("Deployer balance after withdrawal:", ethers.utils.formatEther(deployerBalanceAfter));
    withdrawalAmount = ethers.utils.formatEther(await deployerBalanceAfter.sub(deployerBalanceBefore));
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
