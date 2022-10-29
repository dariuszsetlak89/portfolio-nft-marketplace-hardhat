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
    // Get contract: NftMarketplace
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    // Get contract: BasicNft1
    const basicNft1 = await ethers.getContract("BasicNft1");
    // Get contract: BasicNft2
    const basicNft2 = await ethers.getContract("BasicNft2");
    // Get contract: BasicNft3
    const basicNft3 = await ethers.getContract("BasicNft3");
    // Read existing addresses from file
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"));
    const chainId = network.config.chainId.toString();
    if (chainId in contractAddresses) {
        // NftMarketplace address update
        const nftMarketplaceChainAddress = contractAddresses[chainId]["NftMarketplace"];
        console.log(nftMarketplaceChainAddress);
        if (!nftMarketplaceChainAddress.includes(nftMarketplace.address)) {
            nftMarketplaceChainAddress.pop();
            nftMarketplaceChainAddress.push(nftMarketplace.address);
        }

        // BasicNft1 address update
        const basicNft1ChainAddress = contractAddresses[chainId]["BasicNft1"];
        if (!basicNft1ChainAddress.includes(basicNft1.address)) {
            basicNft1ChainAddress.pop();
            basicNft1ChainAddress.push(basicNft1.address);
        }
        // BasicNft2 address update
        const basicNft2ChainAddress = contractAddresses[chainId]["BasicNft2"];
        if (!basicNft2ChainAddress.includes(basicNft2.address)) {
            basicNft2ChainAddress.pop();
            basicNft2ChainAddress.push(basicNft2.address);
        }
        // BasicNft3 address update
        const basicNft3ChainAddress = contractAddresses[chainId]["BasicNft3"];
        if (!basicNft3ChainAddress.includes(basicNft3.address)) {
            basicNft3ChainAddress.pop();
            basicNft3ChainAddress.push(basicNft3.address);
        }
    } else {
        // Save new smart contract addresses
        contractAddresses[chainId] = {
            NftMarketplace: [nftMarketplace.address],
            BasicNft1: [basicNft1.address],
            BasicNft2: [basicNft2.address],
            BasicNft3: [basicNft3.address],
        };
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}

async function updateAbi() {
    // Get contract: NftMarketplace
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    // Get contract: BasicNft1 - ABI is exactly the same for all BasicNfts
    const basicNft = await ethers.getContract("BasicNft1");
    // Write to file
    fs.writeFileSync(`${frontEndAbiLocation}NftMarketplace.json`, nftMarketplace.interface.format(ethers.utils.FormatTypes.json));
    fs.writeFileSync(`${frontEndAbiLocation}BasicNft.json`, basicNft.interface.format(ethers.utils.FormatTypes.json));
}

module.exports.tags = ["all", "FrontEnd"];
