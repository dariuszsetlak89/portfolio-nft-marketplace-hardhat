// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

///////////////
//  Imports  //
///////////////
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//////////////
//  Errors  //
//////////////
error CuteNft__AlreadyInitialized();
error CuteNft__ReceivedTransferReverted();
error CuteNft__InvalidFunctionCall();

/**
 * @title CuteNft contract
 * @author Dariusz Setlak
 * @notice The CuteNft Smart Contract
 * @dev The smart contract for minting test basic NFTs for testing `NFT Marketplace`.
 * Smart contract contains the following functions:
 * External functions: mintNft
 * Override functions: tokenURI
 * Getter functions: getTokenCounter
 */
contract CuteNft is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;

    //////////////
    //  Events  //
    //////////////
    event CuteNftMinted(uint256 indexed tokenId);

    /////////////////////
    //  NFT variables  //
    /////////////////////

    /// @dev Counter of tokenIds
    Counters.Counter private s_tokenIdCounter;

    /// @dev Array of all avaliable token uris.
    string[] internal s_cuteNftUris;

    /// @dev Contract initialization flag.
    bool private s_initialized;

    ///////////////////
    //  Constructor  //
    ///////////////////

    /**
     * @dev `CuteNft` contract constructor.
     * Passes given parameters to OpenZeppelin library ERC721 constructor, which use them
     * to construct a standard ERC-721 token.
     * @param name token name
     * @param symbol token symbol
     * @param uris token uris array
     */
    constructor(
        string memory name,
        string memory symbol,
        string[] memory uris
    ) ERC721(name, symbol) {
        _initializeContract(uris);
    }

    ///////////////////
    // Init Function //
    ///////////////////

    /**
     * @dev Initialization of token URI parameters
     * @param _uris token URI's array
     */
    function _initializeContract(string[] memory _uris) private {
        if (s_initialized) {
            revert CuteNft__AlreadyInitialized();
        }
        s_cuteNftUris = _uris;
        s_initialized = true;
    }

    ////////////////////////
    // External Functions //
    ////////////////////////

    /**
     * @dev Function `mintNft` allows anyone to mint new NFT tokens.
     * Function calls `_mintNft` function from OpenZeppelin contract ERC721 to mint new token to
     * user's account. After that function calls `_setTokenURI` function from contract
     * ERC721URIStorage to set token URI from `s_cuteNftUris` array at the index of given number.
     * @param _to Player's address
     * @param _uriIndex `s_cuteNftUris` array index
     */
    function mintNft(address _to, uint256 _uriIndex) external {
        uint256 newTokenId = s_tokenIdCounter.current();
        s_tokenIdCounter.increment();
        _safeMint(_to, newTokenId);
        _setTokenURI(newTokenId, s_cuteNftUris[_uriIndex]);
    }

    ////////////////////////
    // Override Functions //
    ////////////////////////

    /// @dev The following functions are overrides required by Solidity.

    /**
     * @dev Function overrides ERC721 and ERC721URIStorage libraries functions
     * @param _tokenId unique id of new minted token
     */
    function _burn(uint256 _tokenId) internal override(ERC721, ERC721URIStorage) {}

    /**
     * @dev Getter function to get token URI of given index from token URI's array.
     * Function overrides ERC721 and ERC721URIStorage libraries functions.
     * @param _index unique id of new minted token
     * @return Value of token URI of given index from token URI's array
     */
    function tokenURI(uint256 _index) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return s_cuteNftUris[_index];
    }

    //////////////////////
    // Getter Functions //
    //////////////////////

    /**
     * @dev Getter function to get contract initialization status.
     * @return Value of `s_initialized` variable
     */
    function getInitialized() public view returns (bool) {
        return s_initialized;
    }

    /**
     * @dev Getter function to get the total number of NFTs minted using this contract.
     * @return Total number of NFTs minted using this contract
     */
    function getTokenCounter() public view returns (Counters.Counter memory) {
        return s_tokenIdCounter;
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
        revert CuteNft__ReceivedTransferReverted();
    }

    /**
     * @notice Fallback function
     * @dev Function executes if none of the contract functions match the intended function calls.
     * Function reverts transaction if called function is not found in the contract.
     */
    fallback() external payable {
        revert CuteNft__InvalidFunctionCall();
    }
}
