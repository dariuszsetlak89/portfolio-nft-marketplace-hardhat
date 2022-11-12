const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Marketplace Staging Test", function () {
          let nftMarketplace,
              nftMarketplaceContract,
              cuteNft,
              cuteNftContract,
              deployer,
              user,
              updatedPrice,
              firstListing,
              secondListing,
              thirdListing,
              deployerBalanceBefore,
              deployerBalanceAfter;

          const PRICE = ethers.utils.parseEther("1");

          beforeEach(async () => {
              //////////////////////////////////////////////////////////////////////
              //// Deploy all smart contracts - COMMENT THIS LINE FOR TESTNET TESTS
              // await deployments.fixture(["all"]);
              //////////////////////////////////////////////////////////////////////

              //// Get accounts: deployer, user
              [deployer, user] = await ethers.getSigners();

              //// Get contract: nftMarketplace
              nftMarketplaceContract = await ethers.getContract("NftMarketplace");
              nftMarketplace = nftMarketplaceContract.connect(deployer);

              //// Get contract: CuteNft
              cuteNftContract = await ethers.getContract("CuteNft");
              cuteNft = cuteNftContract.connect(deployer);
          });

          describe("NFT Marketplace Usage", async () => {
              it("NFT Marketplace Usage", async () => {
                  console.log("-------------------------------------------------------------");
                  console.log("                !!! NFT Marketplace Usage !!!                ");
                  console.log("-------------------------------------------------------------");

                  // Test description:
                  //// 1) Deployer mints 3 CuteNft items
                  //// 2) Deployer lists minted NFTs
                  //// 3) User buys first NFT item
                  //// 4) Deployer updates listing price of second NFT
                  //// 5) User buys second NFT item
                  //// 6) Deployer cancels listing of third NFT item
                  //// 7) Deployer witrdraws proceeds
                  //// 8) FINAL NFTS' OWNERSHIPS

                  // -------------------------------------------------------------------------

                  //// 1) Deployer mints 3 CuteNft items
                  console.log("1) Deployer mints 3 CuteNft items");
                  // Mint NFTs - deployer
                  expect(await cuteNft.mintNft(deployer.address, 0))
                      .to.emit("CuteNftMinted")
                      .withArgs(0);
                  expect(await cuteNft.mintNft(deployer.address, 1))
                      .to.emit("CuteNftMinted")
                      .withArgs(0);
                  expect(await cuteNft.mintNft(deployer.address, 2))
                      .to.emit("CuteNftMinted")
                      .withArgs(0);

                  console.log("-------------------------------------------------------------");

                  //// 2) Deployer lists minted NFTs
                  console.log("2) Deployer lists minted NFTs");
                  // Approve NFTs to be listed on the NFT Marketplace
                  await cuteNft.approve(nftMarketplace.address, 0);
                  await cuteNft.approve(nftMarketplace.address, 1);
                  await cuteNft.approve(nftMarketplace.address, 2);
                  // List NFTs on the NFT Marketplace
                  expect(await nftMarketplace.listItem(cuteNft.address, 0, PRICE))
                      .to.emit("ItemListed")
                      .withArgs(deployer.address, cuteNft.address, 0, PRICE);
                  expect(await nftMarketplace.listItem(cuteNft.address, 1, PRICE))
                      .to.emit("ItemListed")
                      .withArgs(deployer.address, cuteNft.address, 1, PRICE);
                  expect(await nftMarketplace.listItem(cuteNft.address, 2, PRICE))
                      .to.emit("ItemListed")
                      .withArgs(deployer.address, cuteNft.address, 2, PRICE);
                  // Get listings
                  firstListing = await nftMarketplace.getListing(cuteNft.address, 0);
                  console.log("First cuteNft listing price:", ethers.utils.formatEther(firstListing.price.toString()));
                  console.log("First cuteNft seller:", firstListing.seller.toString());
                  //
                  secondListing = await nftMarketplace.getListing(cuteNft.address, 1);
                  console.log("Second cuteNft listing price:", ethers.utils.formatEther(secondListing.price.toString()));
                  console.log("Second cuteNft seller:", secondListing.seller.toString());
                  //
                  thirdListing = await nftMarketplace.getListing(cuteNft.address, 2);
                  console.log("Third cuteNft listing price:", ethers.utils.formatEther(thirdListing.price.toString()));
                  console.log("Third cuteNft seller:", thirdListing.seller.toString());

                  console.log("-------------------------------------------------------------");

                  //// 3) User buys first NFT item
                  console.log("3) User buys first NFT item");
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  expect(await nftMarketplace.buyItem(cuteNft.address, 0, { value: PRICE }))
                      .to.emit("ItemBought")
                      .withArgs(deployer.address, cuteNft.address, 0, PRICE);
                  //
                  cuteNftNewOwner = await cuteNft.ownerOf(0);
                  console.log("cuteNft newOwner:", cuteNftNewOwner);
                  //
                  cuteNftListing = await nftMarketplace.getListing(cuteNft.address, 0);
                  console.log("cuteNft delisted:");
                  console.log("cuteNft listing price:", ethers.utils.formatEther(cuteNftListing.price.toString()));
                  console.log("cuteNft seller:", cuteNftListing.seller.toString());

                  console.log("-------------------------------------------------------------");

                  //// 4) Deployer updates listing price of second NFT
                  console.log("4) Deployer updates listing price of second NFT");
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  updatedPrice = ethers.utils.parseEther("2");
                  expect(await nftMarketplace.updateListing(cuteNft.address, 1, updatedPrice))
                      .to.emit("ItemListed")
                      .withArgs(deployer.address, cuteNft.address, 1, PRICE);
                  cuteNftListing = await nftMarketplace.getListing(cuteNft.address, 1);
                  console.log("cuteNft new listing price:", ethers.utils.formatEther(cuteNftListing.price.toString()));

                  console.log("-------------------------------------------------------------");

                  //// 5) User buys second NFT item
                  console.log("5) User buys second NFT item");
                  nftMarketplace = nftMarketplaceContract.connect(user);
                  expect(await nftMarketplace.buyItem(cuteNft.address, 1, { value: updatedPrice }))
                      .to.emit("ItemBought")
                      .withArgs(deployer.address, cuteNft.address, 1, updatedPrice);
                  //
                  cuteNftNewOwner = await cuteNft.ownerOf(1);
                  console.log("cuteNft newOwner:", cuteNftNewOwner);
                  //
                  cuteNftListing = await nftMarketplace.getListing(cuteNft.address, 1);
                  console.log("cuteNft delisted:");
                  console.log("cuteNft listing price:", ethers.utils.formatEther(cuteNftListing.price.toString()));
                  console.log("cuteNft seller:", cuteNftListing.seller.toString());

                  console.log("-------------------------------------------------------------");

                  //// 6) Deployer cancels listing of third NFT item
                  console.log("6) Deployer cancels listing of third NFT item");
                  nftMarketplace = nftMarketplaceContract.connect(deployer);
                  expect(await nftMarketplace.cancelListing(cuteNft.address, 2))
                      .to.emit("ItemCanceled")
                      .withArgs(deployer.address, cuteNft.address, 2);
                  //
                  cuteNftListing = await nftMarketplace.getListing(cuteNft.address, 2);
                  console.log("cuteNft delisted:");
                  console.log("cuteNft listing price:", ethers.utils.formatEther(cuteNftListing.price.toString()));
                  console.log("cuteNft seller:", cuteNftListing.seller.toString());

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
                  const cuteNft0Owner = await cuteNft.ownerOf(0);
                  console.log("cuteNft0 owner:", cuteNft0Owner);
                  assert.equal(cuteNft0Owner, user.address);
                  //
                  const cuteNft1Owner = await cuteNft.ownerOf(1);
                  console.log("cuteNft1 owner:", cuteNft1Owner);
                  assert.equal(cuteNft1Owner, user.address);
                  //
                  const cuteNft2Owner = await cuteNft.ownerOf(2);
                  console.log("cuteNft2 owner:", cuteNft2Owner);
                  assert.equal(cuteNft2Owner, deployer.address);

                  console.log("-------------------------------------------------------------");
              });
          });
      });
