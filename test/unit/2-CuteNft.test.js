const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("CuteNft Unit Tests", function () {
          let nftMarketplace, nftMarketplaceContract, cuteNft, cuteNftContract, deployer, user;
          const PRICE = ethers.utils.parseEther("0.1");
          const TOKEN_ID = 0;

          beforeEach(async () => {
              //// Deploy all smart contracts
              await deployments.fixture(["all"]);

              //// Get accounts: deployer, user
              [deployer, user] = await ethers.getSigners();

              //// Get contract: nftMarketplace
              nftMarketplaceContract = await ethers.getContract("NftMarketplace");
              nftMarketplace = nftMarketplaceContract.connect(deployer);

              //// Get contract: CuteNft
              cuteNftContract = await ethers.getContract("CuteNft");
              cuteNft = cuteNftContract.connect(deployer);

              //// Mint NFTs - deployer
              await cuteNft.mintNft(deployer.address, 0);
              await cuteNft.approve(nftMarketplace.address, TOKEN_ID);
          });

          describe("constructor", () => {
              it("Initializes the NFT Correctly.", async () => {
                  const name = await cuteNft.name();
                  const symbol = await cuteNft.symbol();
                  const cuteNftUri0 = await cuteNft.tokenURI(0);
                  const cuteNftUri1 = await cuteNft.tokenURI(1);
                  const cuteNftUri2 = await cuteNft.tokenURI(2);
                  const isInitialized = await cuteNft.getInitialized();
                  assert.equal(name, "CuteNft");
                  assert.equal(symbol, "CNFT");
                  assert(cuteNftUri0.includes("ipfs://"));
                  assert(cuteNftUri1.includes("ipfs://"));
                  assert(cuteNftUri2.includes("ipfs://"));
                  assert.equal(isInitialized, true);
              });
          });

          describe("mintNft", () => {
              it("Allows users to mint an NFT, and updates appropriately", async () => {
                  const deployerNftBalance = await cuteNft.balanceOf(deployer.address);
                  // console.log("deployerNftBalance:", deployerNftBalance.toString());
                  assert.equal(deployerNftBalance, 1);
              });
              it("Increments `tokenIdCounter` after NFT mint", async () => {
                  const tokenCounter = await cuteNft.getTokenCounter();
                  assert.equal(tokenCounter.toString(), "1");
              });
          });

          describe("tokenURI", async () => {
              it("should return tokenURI of `CuteNft` contract", async () => {
                  const tokenId = 0;
                  const tokenURI = await cuteNft.tokenURI(tokenId);
                  assert(tokenURI.includes("ipfs://"));
              });
          });

          describe("getTokenCounter", async () => {
              it("should return the total number of NFTs minted using this contract", async () => {
                  const tokenCounter = await cuteNft.getTokenCounter();
                  // console.log("tokenCounter:", tokenCounter.toString());
                  expect(tokenCounter.toString()).to.equal("1");
              });
          });

          describe("receive", async () => {
              it("should invoke the `receive` function and revert transaction with an error", async () => {
                  const [signer] = await ethers.getSigners();
                  const amount = ethers.utils.parseEther("1");
                  const tx = signer.sendTransaction({ to: cuteNft.address, data: "0x", value: amount });
                  await expect(tx).to.be.revertedWith("ReceivedTransferReverted");
              });
          });

          describe("fallback", async () => {
              it("should invoke the `fallback` function and revert transaction with an error", async () => {
                  const [signer] = await ethers.getSigners();
                  const amount = ethers.utils.parseEther("1");
                  const tx = signer.sendTransaction({ to: cuteNft.address, data: "0x01", value: amount });
                  await expect(tx).to.be.revertedWith("InvalidFunctionCall");
              });
          });
      });
