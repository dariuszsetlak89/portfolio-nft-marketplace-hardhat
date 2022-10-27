const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Marketplace Staging Test", function () {
          let nftMarketplace,
              nftMarketplaceContract,
              basicNft1,
              basicNftContract1,
              basicNft2,
              basicNftContract2,
              basicNft3,
              basicNftContract3,
              deployer,
              user,
              updatedPrice,
              basicNft1TokenCounter,
              basicNft2TokenCounter,
              basicNft3TokenCounter,
              basicNft1Listing,
              basicNft2Listing,
              basicNft3Listing,
              basicNft1NewOwner,
              basicNft2NewOwner,
              provider,
              deployerBalanceBefore,
              deployerBalanceAfter;

          const PRICE = ethers.utils.parseEther("1");
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
              basicNftContract1 = await ethers.getContract("BasicNft1");
              basicNft1 = basicNftContract1.connect(deployer);

              //// Get contract: BasicNft2
              basicNftContract2 = await ethers.getContract("BasicNft2");
              basicNft2 = basicNftContract2.connect(deployer);

              //// Get contract: BasicNft3
              basicNftContract3 = await ethers.getContract("BasicNft3");
              basicNft3 = basicNftContract3.connect(deployer);
          });

          describe("NFT Marketplace Usage", async () => {
              it("NFT Marketplace Usage", async () => {
                  console.log("-------------------------------------------------------------");
                  console.log("                !!! NFT Marketplace Usage !!!                ");
                  console.log("-------------------------------------------------------------");

                  // Test description:
                  //// 1) Deployer mints 3 NFT items: BasicNft1, BasicNft2, BasicNft3
                  //// 2) Deployer lists 3 minted NFT items
                  //// 3) User buys item BasicNft1
                  //// 4) Deployer updates listing price of BasicNft2
                  //// 5) User buys item BasicNft2
                  //// 6) Deployer cancels listing of BasicNft3
                  //// 7) Deployer witrdraws proceeds
                  //// 8) FINAL NFTS' OWNERSHIPS

                  // -------------------------------------------------------------------------

                  //// 1) Deployer mints 3 NFT items: BasicNft1, BasicNft2, BasicNft3
                  console.log("1) Deployer mints 3 NFT items: BasicNft1, BasicNft2, BasicNft3");
                  // Mint NFTs - deployer
                  expect(await basicNft1.mintNft())
                      .to.emit("NftMinted")
                      .withArgs(0);
                  expect(await basicNft2.mintNft())
                      .to.emit("NftMinted")
                      .withArgs(0);
                  expect(await basicNft3.mintNft())
                      .to.emit("NftMinted")
                      .withArgs(0);
                  // Get token counters
                  basicNft1TokenCounter = await basicNft1.getTokenCounter();
                  console.log("basicNft1 tokenCounter:", basicNft1TokenCounter.toString());
                  basicNft2TokenCounter = await basicNft1.getTokenCounter();
                  console.log("basicNft2 tokenCounter:", basicNft2TokenCounter.toString());
                  basicNft3TokenCounter = await basicNft1.getTokenCounter();
                  console.log("basicNft3 tokenCounter:", basicNft3TokenCounter.toString());

                  console.log("-------------------------------------------------------------");

                  //// 2) Deployer lists 3 minted NFT items
                  console.log("2) Deployer lists 3 minted NFT items");
                  // Approve NFTs to be listed on the NFT Marketplace
                  await basicNft1.approve(nftMarketplace.address, TOKEN_ID);
                  await basicNft2.approve(nftMarketplace.address, TOKEN_ID);
                  await basicNft3.approve(nftMarketplace.address, TOKEN_ID);
                  // List NFTs on the NFT Marketplace
                  expect(await nftMarketplace.listItem(basicNft1.address, TOKEN_ID, PRICE))
                      .to.emit("ItemListed")
                      .withArgs(deployer, basicNft1.address, TOKEN_ID, PRICE);
                  expect(await nftMarketplace.listItem(basicNft2.address, TOKEN_ID, PRICE))
                      .to.emit("ItemListed")
                      .withArgs(deployer, basicNft2.address, TOKEN_ID, PRICE);
                  expect(await nftMarketplace.listItem(basicNft3.address, TOKEN_ID, PRICE))
                      .to.emit("ItemListed")
                      .withArgs(deployer, basicNft3.address, TOKEN_ID, PRICE);
                  // Get listings
                  basicNft1Listing = await nftMarketplace.getListing(basicNft1.address, TOKEN_ID);
                  console.log("basicNft1 listing price:", ethers.utils.formatEther(basicNft1Listing.price.toString()));
                  console.log("basicNft1 seller:", basicNft1Listing.seller.toString());
                  //
                  basicNft2Listing = await nftMarketplace.getListing(basicNft2.address, TOKEN_ID);
                  console.log("basicNft2 listing price:", ethers.utils.formatEther(basicNft2Listing.price.toString()));
                  console.log("basicNft2 seller:", basicNft2Listing.seller.toString());
                  //
                  basicNft3Listing = await nftMarketplace.getListing(basicNft3.address, TOKEN_ID);
                  console.log("basicNft3 listing price:", ethers.utils.formatEther(basicNft3Listing.price.toString()));
                  console.log("basicNft3 seller:", basicNft3Listing.seller.toString());

                  console.log("-------------------------------------------------------------");

                  //// 3) User buys item BasicNft1
                  console.log("3) User buys item BasicNft1");
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  expect(await nftMarketplace.buyItem(basicNft1.address, TOKEN_ID, { value: PRICE }))
                      .to.emit("ItemBought")
                      .withArgs(deployer, basicNft1.address, TOKEN_ID, PRICE);
                  //
                  basicNft1NewOwner = await basicNft1.ownerOf(TOKEN_ID);
                  console.log("basicNft1 newOwner:", basicNft1NewOwner);
                  //
                  basicNft1Listing = await nftMarketplace.getListing(basicNft1.address, TOKEN_ID);
                  console.log("basicNft1 delisted:");
                  console.log("basicNft1 listing price:", ethers.utils.formatEther(basicNft1Listing.price.toString()));
                  console.log("basicNft1 seller:", basicNft1Listing.seller.toString());

                  console.log("-------------------------------------------------------------");

                  //// 4) Deployer updates listing price of BasicNft2
                  console.log("4) Deployer updates listing price of BasicNft2");
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  updatedPrice = ethers.utils.parseEther("2");
                  expect(await nftMarketplace.updateListing(basicNft2.address, TOKEN_ID, updatedPrice))
                      .to.emit("ItemListed")
                      .withArgs(deployer, basicNft2.address, TOKEN_ID, PRICE);
                  basicNft2Listing = await nftMarketplace.getListing(basicNft2.address, TOKEN_ID);
                  console.log("basicNft2 new listing price:", ethers.utils.formatEther(basicNft2Listing.price.toString()));

                  console.log("-------------------------------------------------------------");

                  //// 5) User buys item BasicNft2
                  console.log("5) User buys item BasicNft2");
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  expect(await nftMarketplace.buyItem(basicNft2.address, TOKEN_ID, { value: updatedPrice }))
                      .to.emit("ItemBought")
                      .withArgs(deployer, basicNft2.address, TOKEN_ID, updatedPrice);
                  //
                  basicNft2NewOwner = await basicNft2.ownerOf(TOKEN_ID);
                  console.log("basicNft2 newOwner:", basicNft2NewOwner);
                  //
                  basicNft2Listing = await nftMarketplace.getListing(basicNft2.address, TOKEN_ID);
                  console.log("basicNft2 delisted:");
                  console.log("basicNft2 listing price:", ethers.utils.formatEther(basicNft2Listing.price.toString()));
                  console.log("basicNft2 seller:", basicNft2Listing.seller.toString());

                  console.log("-------------------------------------------------------------");

                  //// 6) Deployer cancels listing of BasicNft3
                  console.log("6) Deployer cancels listing of BasicNft3");
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  expect(await nftMarketplace.cancelListing(basicNft3.address, TOKEN_ID))
                      .to.emit("ItemCanceled")
                      .withArgs(deployer, basicNft3.address, TOKEN_ID);
                  //
                  basicNft3Listing = await nftMarketplace.getListing(basicNft3.address, TOKEN_ID);
                  console.log("basicNft3 delisted:");
                  console.log("basicNft3 listing price:", ethers.utils.formatEther(basicNft3Listing.price.toString()));
                  console.log("basicNft3 seller:", basicNft3Listing.seller.toString());

                  console.log("-------------------------------------------------------------");

                  //// 7) Deployer witrdraws proceeds
                  console.log("7) Deployer witrdraws proceeds");
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  deployerBalanceBefore = await deployer.getBalance();
                  console.log("Deployer balance before proceeds withdrawal:", ethers.utils.formatEther(deployerBalanceBefore));
                  expect(await nftMarketplace.withdrawProceeds()).to.emit("ProceedsWithdrawalSuccess");
                  deployerBalanceAfter = await deployer.getBalance();
                  console.log("Deployer balance after proceeds withdrawal:", ethers.utils.formatEther(deployerBalanceAfter));
                  console.log(
                      "Deployer balance difference:",
                      ethers.utils.formatEther(await deployerBalanceAfter.sub(deployerBalanceBefore))
                  );

                  console.log("-------------------------------------------------------------");

                  //// 8) FINAL NFTS' OWNERSHIPS
                  console.log("8) FINAL NFTS' OWNERSHIPS");
                  console.log("deployer address:", deployer.address);
                  console.log("user address:", user.address);
                  console.log("");
                  //
                  const basicNft1Owner = await basicNft1.ownerOf(TOKEN_ID);
                  console.log("basicNft1 owner:", basicNft1Owner);
                  assert.equal(basicNft1Owner, user.address);
                  //
                  const basicNft2Owner = await basicNft2.ownerOf(TOKEN_ID);
                  console.log("basicNft2 owner:", basicNft2Owner);
                  assert.equal(basicNft2Owner, user.address);
                  //
                  const basicNft3Owner = await basicNft3.ownerOf(TOKEN_ID);
                  console.log("basicNft3 owner:", basicNft3Owner);
                  assert.equal(basicNft3Owner, deployer.address);

                  console.log("-------------------------------------------------------------");
              });
          });
      });
