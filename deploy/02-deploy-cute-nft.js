const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

let tokenUris = [];

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // Constructor parameters
    const cuteNftName = "CuteNft";
    const cuteNftSymbol = "CNFT";
    const cuteNftUris = [
        "ipfs://bafkreiflfic3maintdekzz34kpwtg2bfyr7g3hbru32lrwtlrhb6qjj53y",
        "ipfs://bafkreifshxij3gmgbh3mogpna77y6wksmi6i6jodxpaikjcfpdgkprqdre",
        "ipfs://bafkreiblpzpljeegrl4kfx3cpvly4kkittwszhn2mvuvvqr2llkjphjrge",
    ];

    // Deployment arguments array
    const args = [cuteNftName, cuteNftSymbol, cuteNftUris];

    // Deploy `CuteNft` contract
    const cuteNft = await deploy("CuteNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // Verify deployed contracts on Etherscan
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(cuteNft.address, args);
    }

    log("-------------------------------------------------------");
};

module.exports.tags = ["all", "cutenft"];
