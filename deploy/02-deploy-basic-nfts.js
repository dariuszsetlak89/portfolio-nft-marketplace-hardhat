const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // Deploy `BasicNft` contract
    let args1 = [];
    const basicNft1 = await deploy("BasicNft1", {
        from: deployer,
        args: args1,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // Deploy `BasicNft` contract
    let args2 = [];
    const basicNft2 = await deploy("BasicNft2", {
        from: deployer,
        args: args2,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // Deploy `BasicNft` contract
    let args3 = [];
    const basicNft3 = await deploy("BasicNft3", {
        from: deployer,
        args: args3,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // Verify deployed contracts on Etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(basicNft1.address, args1);
    }
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(basicNft2.address, args2);
    }
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(basicNft3.address, args3);
    }

    log("-------------------------------------------------------");
};

module.exports.tags = ["all", "BasicNfts"];
