const { moveBlocks } = require("../utils/move-blocks");

/////////////////////////////////////////////
// Use only for testing on developent chains
// Development chains: hardhat, localhost
/////////////////////////////////////////////

const BLOCKS = 1;

async function mine() {
    await moveBlocks(BLOCKS);
}

mine()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
