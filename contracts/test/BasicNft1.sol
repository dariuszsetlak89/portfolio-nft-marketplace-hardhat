// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

///////////////
//  Imports  //
///////////////
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

//////////////
//  Errors  //
//////////////
error BasicNft__ReceivedTransferReverted();
error BasicNft__InvalidFunctionCall();

/**
 * @title BasicNft1 contract
 * @author Dariusz Setlak
 * @notice The BasicNft1 Smart Contract
 * @dev The smart contract for minting test basic NFTs for testing `NFT Marketplace`.
 * Smart contract contains the following functions:
 * Public functions: mintNft
 * Override functions: tokenURI
 * Getter functions: getTokenCounter
 */
contract BasicNft1 is ERC721 {
    //////////////
    //  Events  //
    //////////////
    event NftMinted(uint256 indexed tokenId);

    /////////////////////
    //  NFT variables  //
    /////////////////////
    string public constant TOKEN_URI = "ipfs://QmdryoExpgEQQQgJPoruwGJyZmz6SqV4FRTX1i73CT3iXn";
    uint256 private s_tokenCounter;

    /////////////////
    // Constructor //
    /////////////////

    /**
     * @dev BasicNft1 contract constructor.
     * Create ERC721 `BasicNft1` contract with given NFT name and symbol.
     */
    constructor() ERC721("Cute Doggie", "DOGGIE") {
        s_tokenCounter = 0;
    }

    //////////////////////
    // Public Functions //
    //////////////////////

    /**
     * @notice Function for mint Basic NFT.
     * @dev Function allows user to safe mint BasicNft1 with subsequent tokenId number.
     * This is public function, can be invoked by anyone and anywhere.
     */
    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        emit NftMinted(s_tokenCounter);
    }

    ////////////////////////
    // Override Functions //
    ////////////////////////

    /**
     * @dev Function overrides ERC721 library functions
     * @param _tokenId unique tokenId of new minted token
     * @return Public TOKEN_URI data
     */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        return TOKEN_URI;
    }

    //////////////////////
    // Getter Functions //
    //////////////////////

    /**
     * @dev Getter function to get the total number of NFTs minted using this contract.
     * @return Total number of NFTs minted using this contract
     */
    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    /////////////////////
    // Other Functions //
    /////////////////////

    /**
     * @notice Receive
     * @dev Function executes if unintended fund transfer received.
     * This contract doesn't allows to receive fund transfers, thererfore `receive` function
     * reverts all unintended fund transfers.
     */
    receive() external payable {
        revert BasicNft__ReceivedTransferReverted();
    }

    /**
     * @notice Fallback function
     * @dev Function executes if none of the contract functions match the intended function calls.
     * Function reverts transaction if called function is not found in the contract.
     */
    fallback() external payable {
        revert BasicNft__InvalidFunctionCall();
    }
}
