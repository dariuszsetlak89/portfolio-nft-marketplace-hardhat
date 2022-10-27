const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft1 Unit Tests", function () {
          let nftMarketplace, nftMarketplaceContract, basicNft1, basicNft1Contract, deployer, user;
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

              //// Get contract: BasicNft1
              basicNft1Contract = await ethers.getContract("BasicNft1");
              basicNft1 = basicNft1Contract.connect(deployer);

              //// Mint NFTs - deployer
              await basicNft1.mintNft();
              await basicNft1.approve(nftMarketplace.address, TOKEN_ID);
          });

          describe("tokenURI", async () => {
              it("should return tokenURI of `BasicNft1` contract", async () => {
                  const tokenId = 0;
                  const tokenURI = await basicNft1.tokenURI(tokenId);
                  assert(tokenURI.includes("ipfs://"));
              });
          });

          describe("getTokenCounter", async () => {
              it("should return the total number of NFTs minted using this contract", async () => {
                  const tokenCounter = await basicNft1.getTokenCounter();
                  // console.log("tokenCounter:", tokenCounter.toString());
                  expect(tokenCounter.toString()).to.equal("1");
              });
          });

          describe("receive", async () => {
              it("should invoke the `receive` function and revert transaction with an error", async () => {
                  const [signer] = await ethers.getSigners();
                  const amount = ethers.utils.parseEther("1");
                  const tx = signer.sendTransaction({ to: basicNft1.address, data: "0x", value: amount });
                  await expect(tx).to.be.revertedWith("ReceivedTransferReverted");
              });
          });

          describe("fallback", async () => {
              it("should invoke the `fallback` function and revert transaction with an error", async () => {
                  const [signer] = await ethers.getSigners();
                  const amount = ethers.utils.parseEther("1");
                  const tx = signer.sendTransaction({ to: basicNft1.address, data: "0x01", value: amount });
                  await expect(tx).to.be.revertedWith("InvalidFunctionCall");
              });
          });
      });
