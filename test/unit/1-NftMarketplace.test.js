const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NftMarketplace Unit Tests", function () {
          let nftMarketplace, nftMarketplaceContract, cuteNft, cuteNftContract, deployer, user;
          const PRICE = ethers.utils.parseEther("0.1");
          const TOKEN_ID = 0;

          beforeEach(async () => {
              //// Deploy all smart contracts
              await deployments.fixture(["all"]);

              //// Get accounts: deployer, user
              //// Use getNamedAccounts:
              // const deployer = (await getNamedAccounts()).deployer;
              // const user = (await getNamedAccounts()).user;
              //// Use ethers getSigners accounts:
              // const deployer = (await ethers.getSigners())[0];
              // const user = (await ethers.getSigners())[1];
              [deployer, user] = await ethers.getSigners();
              // console.log(deployer.address);
              // console.log(user.address);

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

          describe("listItem", function () {
              it("reverts when try to list already listed item", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  const alreadyListedError = `AlreadyListed("${cuteNft.address}", ${TOKEN_ID})`;
                  // console.log(alreadyListedError);
                  await expect(nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE)).to.be.revertedWith(alreadyListedError);
              });
              it("reverts when not owner try to list NFT item on the marketplace", async function () {
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await expect(nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE)).to.be.revertedWith("IsNotOwner");
              });
              it("reverts when listing price is 0", async function () {
                  const listingPrice = 0;
                  await expect(nftMarketplace.listItem(cuteNft.address, TOKEN_ID, listingPrice)).to.be.revertedWith("PriceMustBeAboveZero");
              });
              it("reverts when approvals needed for listing not granted", async function () {
                  await cuteNft.approve(ethers.constants.AddressZero, TOKEN_ID); // approve address 0, not contract
                  await expect(nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE)).to.be.revertedWith("NotAprovedForMarketplace");
              });
              it("updates listings mapping with seller address and listing price", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  const listing = await nftMarketplace.getListing(cuteNft.address, TOKEN_ID);
                  assert.equal(listing.price.toString(), PRICE.toString());
                  assert.equal(listing.seller.toString(), deployer.address);
              });
              it("emits an event after listing an item is done", async function () {
                  expect(await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE))
                      .to.emit("ItemListed")
                      .withArgs(deployer, cuteNft.address, TOKEN_ID, PRICE);
              });
          });

          describe("buyItem", function () {
              it("reverts when try to buy not listed item", async function () {
                  const notListedError = `NotListed("${cuteNft.address}", ${TOKEN_ID})`;
                  // console.log(notListedError);
                  await expect(nftMarketplace.buyItem(cuteNft.address, TOKEN_ID)).to.be.revertedWith(notListedError);
              });
              it("reverts when owner try to buy NFT item", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  await expect(nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE })).to.be.revertedWith("IsOwner");
              });
              it("reverts when buyer didn't sent enough to meet listed NFT price", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  const priceNotMetError = `PriceNotMet("${cuteNft.address}", ${TOKEN_ID}, ${PRICE})`;
                  // console.log(priceNotMetError);
                  await expect(nftMarketplace.buyItem(cuteNft.address, TOKEN_ID)).to.be.revertedWith(priceNotMetError);
              });
              it("updates seller's proceeds mapping", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE });
                  const deployerProceeds = await nftMarketplace.getProceeds(deployer.address);
                  // console.log("deployerProceeds:", deployerProceeds.toString());
                  // console.log("PRICE:", PRICE.toString());
                  assert.equal(deployerProceeds.toString(), PRICE.toString());
              });
              it("delists bought NFT item from listings", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE });
                  const listing = await nftMarketplace.getListing(cuteNft.address, TOKEN_ID);
                  // console.log("listing price:", listing.price.toString());
                  // console.log("listing seller:", listing.seller.toString());
                  assert.equal(listing.price.toString(), "0");
                  assert.equal(listing.seller.toString(), ethers.constants.AddressZero.toString());
              });
              it("checks ownership of NFT item after purchase", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE });
                  const newOwner = await cuteNft.ownerOf(TOKEN_ID);
                  // console.log("new NFT owner:", newOwner);
                  assert.equal(newOwner, user.address);
              });
              it("emits an event after NFT item purchase", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  expect(await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE }))
                      .to.emit("ItemBought")
                      .withArgs(deployer, cuteNft.address, TOKEN_ID, PRICE);
              });
          });

          describe("cancelListing", function () {
              it("reverts when try to cencel not listed item", async function () {
                  const notListedError = `NotListed("${cuteNft.address}", ${TOKEN_ID})`;
                  // console.log(notListedError);
                  await expect(nftMarketplace.cancelListing(cuteNft.address, TOKEN_ID)).to.be.revertedWith(notListedError);
              });
              it("reverts when not owner try to cancel listed NFT item", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await expect(nftMarketplace.cancelListing(cuteNft.address, TOKEN_ID)).to.be.revertedWith("IsNotOwner");
              });
              it("removes listed NFT item", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  await nftMarketplace.cancelListing(cuteNft.address, TOKEN_ID);
                  const listing = await nftMarketplace.getListing(cuteNft.address, TOKEN_ID);
                  // console.log("listing price:", listing.price.toString());
                  // console.log("listing seller:", listing.seller.toString());
                  assert.equal(listing.price.toString(), "0");
                  assert.equal(listing.seller.toString(), ethers.constants.AddressZero.toString());
              });
              it("emits an event after cancel NFT item listing", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  expect(await nftMarketplace.cancelListing(cuteNft.address, TOKEN_ID))
                      .to.emit("ItemCanceled")
                      .withArgs(deployer, cuteNft.address, TOKEN_ID);
              });
          });

          describe("updateListing", function () {
              it("reverts when try to update not listed item", async function () {
                  const notListedError = `NotListed("${cuteNft.address}", ${TOKEN_ID})`;
                  // console.log(notListedError);
                  const updatedPrice = ethers.utils.parseEther("0.2");
                  await expect(nftMarketplace.updateListing(cuteNft.address, TOKEN_ID, updatedPrice)).to.be.revertedWith(notListedError);
              });
              it("reverts when not owner try to update the price of listed NFT item", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  const updatedPrice = ethers.utils.parseEther("0.2");
                  await expect(nftMarketplace.updateListing(cuteNft.address, TOKEN_ID, updatedPrice)).to.be.revertedWith("IsNotOwner");
              });
              it("updates the price of listed NFT item", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  const updatedPrice = ethers.utils.parseEther("0.2");
                  await nftMarketplace.updateListing(cuteNft.address, TOKEN_ID, updatedPrice);
                  const listing = await nftMarketplace.getListing(cuteNft.address, TOKEN_ID);
                  // console.log("listing price:", listing.price.toString());
                  assert.equal(listing.price.toString(), updatedPrice.toString());
              });
              it("emits an event after update price of listed NFT item", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  const updatedPrice = ethers.utils.parseEther("0.2");
                  expect(await nftMarketplace.updateListing(cuteNft.address, TOKEN_ID, updatedPrice))
                      .to.emit("ItemListed")
                      .withArgs(deployer, cuteNft.address, TOKEN_ID, updatedPrice);
              });
          });

          describe("withdrawProceeds", function () {
              it("doesn't allow to proceed with 0 withdrawal", async function () {
                  await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith("NoProceeds");
              });
              it("withdraws proceeds", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE });
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  //
                  const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address);
                  const deployerBalanceBefore = await deployer.getBalance();
                  const txResponse = await nftMarketplace.withdrawProceeds();
                  const transactionReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const deployerBalanceAfter = await deployer.getBalance();
                  assert.equal(deployerBalanceAfter.add(gasCost).toString(), deployerProceedsBefore.add(deployerBalanceBefore).toString());
              });
              it("updates seller's proceeds mapping to 0 value", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE });
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  // const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address);
                  // console.log("deployerProceedsBefore:", deployerProceedsBefore.toString());
                  await nftMarketplace.withdrawProceeds();
                  const deployerProceedsAfter = await nftMarketplace.getProceeds(deployer.address);
                  // console.log("deployerProceedsAfter:", deployerProceedsAfter.toString());
                  assert.equal(deployerProceedsAfter.toString(), "0");
              });
              it("withdraws proceeds to seller's account", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE });
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  //
                  const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address);
                  // console.log("deployerProceedsBefore:", deployerProceedsBefore.toString());
                  const deployerBalanceBefore = await deployer.getBalance();
                  // console.log("deployerBalanceBefore:", deployerBalanceBefore.toString());
                  const txResponse = await nftMarketplace.withdrawProceeds();
                  const transactionReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  // console.log("gasUsed:", gasUsed.toString());
                  // console.log("effectiveGasPrice:", effectiveGasPrice.toString());
                  const gasCost = gasUsed.mul(effectiveGasPrice); // BigNumbers multiplication: gasUsed * effectiveGasPrice
                  // console.log("gasCost:", gasCost.toString());
                  const deployerBalanceAfter = await deployer.getBalance();
                  // console.log("deployerBalanceAfter:", deployerBalanceAfter.toString());
                  assert.equal(deployerBalanceBefore.add(deployerProceedsBefore).toString(), deployerBalanceAfter.add(gasCost).toString());
              });
              it("emits an event after proceeds withdrawal success", async function () {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE });
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  expect(await nftMarketplace.withdrawProceeds()).to.emit("ProceedsWithdrawalSuccess");
              });
          });

          describe("getListing", async () => {
              it("function returns listing price and seller address of listed NFT", async () => {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  const listing = await nftMarketplace.getListing(cuteNft.address, TOKEN_ID);
                  // console.log("PRICE:", PRICE.toString());
                  // console.log("listing price:", listing.price.toString());
                  // console.log("deployer:", deployer.address);
                  // console.log("listing seller:", listing.seller.toString());
                  assert.equal(listing.price.toString(), PRICE.toString());
                  assert.equal(listing.seller, deployer.address);
              });
          });

          describe("getProceeds", async () => {
              it("function returns proceeds of given seller", async () => {
                  await nftMarketplace.listItem(cuteNft.address, TOKEN_ID, PRICE);
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  await nftMarketplace.buyItem(cuteNft.address, TOKEN_ID, { value: PRICE });
                  const deployerProceeds = await nftMarketplace.getProceeds(deployer.address);
                  // console.log("deployerProceeds:", deployerProceeds.toString());
                  // console.log("PRICE:", PRICE.toString());
                  assert.equal(deployerProceeds.toString(), PRICE.toString());
              });
          });

          describe("getBalance", async () => {
              it("function returns balance of this `NftMarketplace` contract", async () => {
                  await nftMarketplace.fallback({ value: ethers.utils.parseEther("1") });
                  const balance = await nftMarketplace.getBalance(); // BigNumber
                  const balanceConverted = ethers.utils.formatEther(balance).toString(); // Number
                  // console.log("balance:", balanceConverted);
                  expectedEthBalance = ethers.utils.parseEther("1"); // 1 ETH
                  assert.equal(balance.toString(), expectedEthBalance.toString());
              });
          });

          describe("receive", async () => {
              it("should invoke the `receive` function and receive ETH payment", async () => {
                  const [signer] = await ethers.getSigners();
                  const ethAmount = ethers.utils.parseEther("1");
                  const tx = signer.sendTransaction({ to: nftMarketplace.address, data: "0x", value: ethAmount });
                  await expect(tx).to.emit(nftMarketplace, "TransferReceived").withArgs(ethAmount);
                  // const balance = ethers.utils.formatEther(await nftMarketplace.getBalance()).toString();
                  // console.log("balance:", balance.toString());
              });
          });

          describe("fallback", async () => {
              it("should invoke the `fallback` function and receive ETH payment", async () => {
                  const [signer] = await ethers.getSigners();
                  const ethAmount = ethers.utils.parseEther("1");
                  const tx = signer.sendTransaction({ to: nftMarketplace.address, data: "0x01", value: ethAmount });
                  await expect(tx).to.emit(nftMarketplace, "TransferReceived").withArgs(ethAmount);
                  // const balance = ethers.utils.formatEther(await nftMarketplace.getBalance()).toString();
                  // console.log("balance:", balance.toString());
              });
          });
      });
