const networkConfig = {
    31337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
    },
};

const developmentChains = ["hardhat", "localhost"];

// Next.js The Graph
const frontEndContractsFile = "../portfolio-nft-marketplace-nextjs-thegraph/constants/contractAddresses.json";
const frontEndAbiLocation = "../portfolio-nft-marketplace-nextjs-thegraph/constants/";

module.exports = {
    networkConfig,
    developmentChains,
    frontEndContractsFile,
    frontEndAbiLocation,
};
