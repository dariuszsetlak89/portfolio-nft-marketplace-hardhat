// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

///////////////
//  Imports  //
///////////////
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

//////////////
//  Errors  //
//////////////
error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotAprovedForMarketplace();
error NftMarketplace__IsNotOwner();
error NftMarketplace__IsOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceeds();

////////////////////
// Smart Contract //
////////////////////

/**
 * @title NftMarketplace contract
 * @author Dariusz Setlak
 * @notice The NFT Marketplace Smart Contract
 * @dev The main smart contract of `NFT Marketplace` containing the following functions:
 */
contract NftMarketplace is ReentrancyGuard {
    ///////////////
    //  Scructs  //
    ///////////////

    /**
     * @dev Struct of item listing parameters.
     * uint256 price - item listing price.
     * address seller - item seller address
     */
    struct Listing {
        uint256 price;
        address seller;
    }

    //////////////
    //  Events  //
    //////////////
    event ItemListed(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    event ItemBought(address indexed buyer, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 indexed tokenId);
    event ProceedsWithdrawal(address indexed seller, uint256 indexed amount);
    event TransferReceived(uint256 indexed amount);

    ////////////////
    //  Mappings  //
    ////////////////

    /// @dev Mapping NFT contract address to mapping of NFT TokenId to Listing struct.
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    // Seller address -> Amount earned
    /// @dev Mapping Seller address to Seller's amount earned.
    mapping(address => uint256) private s_proceeds;

    /////////////////
    //  Modifiers  //
    /////////////////

    /// @dev Modifier checks if NFT Spender is the NFT Owner
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__IsNotOwner();
        }
        _;
    }

    /// @dev Modifier checks if NFT Spender is NOT the NFT Owner
    modifier isNotOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender == owner) {
            revert NftMarketplace__IsOwner();
        }
        _;
    }

    /**
     * @dev Modifier checks if NFT item is listed to NFT Marketplace.
     * If listing price is <=0 then NFT item is not yet listed
     */
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    /**
     * @dev Modifier checks if NFT item is NOT listed to NFT Marketplace.
     * If listing price is > 0 then NFT item is already listed.
     */
    modifier notListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    ////////////////////////
    // External Functions //
    ////////////////////////

    /**
     * @notice Function for listing NFT item on the NFT Marketplace.
     * @dev Function allows owner of the NFT item to list it on the NFT Marketplace.
     * This is external function, invoked by the user, using front-end application.
     *
     * There are two ways to list item on the marketplace:
     * 1. Send the NFT to the contract. Transfer -> Contract "hold" the NFT.
     * 2. Owners can still hold their NFT, and give the marketplace approval to sell the NFT for them.
     * In this project, second option was chosen.
     *
     * @param nftAddress listing NFT item contract address
     * @param tokenId listing NFT item tokenId
     * @param price the sale price of listing NFT item
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
        // Check if listing price set by user is > 0
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        // Check if NFT item is approved for listing in marketplace
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotAprovedForMarketplace();
        }
        // Update the `s_listings` mapping
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    /**
     * @notice Function for buy NFT item on the NFT Marketplace.
     * @dev Function allows user buy chosen NFT item on the NFT Marketplace.
     * @param nftAddress listing NFT item contract address
     * @param tokenId listing NFT item tokenId
     */
    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
        isNotOwner(nftAddress, tokenId, msg.sender)
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        // Check if sent value met the item price
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        // Update seller account by sold NFT item price - update mapping `s_proceeds`
        s_proceeds[listedItem.seller] = s_proceeds[listedItem.seller] += msg.value;
        // Delete bought NFT item listing - update mapping `s_listings`
        delete (s_listings[nftAddress][tokenId]);
        // Transfer NFT item to buyer address
        IERC721 nft = IERC721(nftAddress);
        nft.safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    /**
     * @notice Function for cancel NFT item listing on the NFT Marketplace.
     * @dev Function allows user to cancel previously listed NFT item from NFT Marketplace listings.
     * @param nftAddress listing NFT item contract address
     * @param tokenId listing NFT item tokenId
     */
    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    /**
     * @notice Function for update NFT item listing price on the NFT Marketplace.
     * @dev Function allows user to update the price of already listed NFT item on NFT Marketplace.
     * @param nftAddress listing NFT item contract address
     * @param tokenId listing NFT item tokenId
     * @param newPrice new NFT item listing purchase price
     */
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
        // Updating listed item == relisting this item
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    /**
     * @notice Function for withdrawing accumulated by NFT seller funds.
     * @dev Function allows user to withdraw accumulated by the NFT seller funds.
     */
    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (success) {
            emit ProceedsWithdrawal(msg.sender, proceeds);
        }
    }

    //////////////////////
    // Getter Functions //
    //////////////////////

    /**
     * @notice Function to get NFT item listing status
     * @dev Getter function to get NFT item listing information.
     * @param nftAddress listing NFT item contract address
     * @param tokenId listing NFT item tokenId
     * @return Private mapping value of Listing struct, containing listing price and seller's address.
     */
    function getListing(address nftAddress, uint256 tokenId) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    /**
     * @notice Function to get user (seller) withdrawal account amount.
     * @dev Getter function to get user (seller) withdrawal account amount.
     * @param seller the seller address
     * @return Private mapping value of seller's withdrawal account amount.
     */
    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }

    /**
     * @dev Getter function to get this `nftMarketplace` smart contract balance.
     * @return Balnace of this smart contract.
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /////////////////////
    // Other Functions //
    /////////////////////

    /**
     * @notice Receive ETH
     * @dev Function allows to receive ETH sent to smart contract.
     */
    receive() external payable {
        // console.log("Function `receive` invoked");
        emit TransferReceived(msg.value);
    }

    /**
     * @notice Fallback function
     * @dev Function executes if none of the contract functions (function selector) match the intended
     * function calls.
     */
    fallback() external payable {
        // console.log("Function `fallback` invoked");
        emit TransferReceived(msg.value);
    }
}
