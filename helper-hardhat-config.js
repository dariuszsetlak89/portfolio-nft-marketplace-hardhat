const networkConfig = {
    31337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
    },
};

const developmentChains = ["hardhat", "localhost"];

// Next.js Moralis
const moralisContractsFile = "../portfolio-nft-marketplace-nextjs-moralis/constants/contractAddresses.json";
const moralisAbiLocation = "../portfolio-nft-marketplace-nextjs-moralis/constants/";

// Next.js The Graph
const theGraphContractsFile = "../portfolio-nft-marketplace-nextjs-thegraph/constants/contractAddresses.json";
const theGraphAbiLocation = "../portfolio-nft-marketplace-nextjs-thegraph/constants/";

module.exports = {
    networkConfig,
    developmentChains,
    moralisContractsFile,
    moralisAbiLocation,
    theGraphContractsFile,
    theGraphAbiLocation,
};
