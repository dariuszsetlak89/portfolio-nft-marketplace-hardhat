const { frontEndContractsFile, frontEndAbiLocation } = require("../helper-hardhat-config");
const { network } = require("hardhat");
require("dotenv").config();
const fs = require("fs");

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END == "true") {
        console.log("Updating front end...");
        await updateContractAddresses();
        await updateAbi();
        console.log("Front end updated!");
        console.log("-------------------------------------------------------");
    }
};

async function updateContractAddresses() {
    // Get contracts
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const cuteNft = await ethers.getContract("CuteNft");
    // Read existing addresses from file
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"));
    const chainId = network.config.chainId.toString();
    if (chainId in contractAddresses) {
        // NftMarketplace contract address update
        const nftMarketplaceChainAddress = contractAddresses[chainId]["NftMarketplace"];
        if (!nftMarketplaceChainAddress.includes(nftMarketplace.address)) {
            nftMarketplaceChainAddress.pop();
            nftMarketplaceChainAddress.push(nftMarketplace.address);
        }
        // CuteNft contract address update
        const cuteNftChainAddress = contractAddresses[chainId]["CuteNft"];
        if (!cuteNftChainAddress.includes(cuteNft.address)) {
            cuteNftChainAddress.pop();
            cuteNftChainAddress.push(cuteNft.address);
        }
    } else {
        // Save new smart contract addresses
        contractAddresses[chainId] = {
            NftMarketplace: [nftMarketplace.address],
            CuteNft: [cuteNft.address],
        };
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}

async function updateAbi() {
    // Get contracts
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const cuteNft = await ethers.getContract("CuteNft");
    // Write to file
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    );
    fs.writeFileSync(`${frontEndAbiLocation}CuteNft.json`, cuteNft.interface.format(ethers.utils.FormatTypes.json));
}

module.exports.tags = ["all", "frontend"];
