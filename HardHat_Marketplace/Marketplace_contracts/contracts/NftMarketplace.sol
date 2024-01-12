// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NftMarketplace__PriceMustNotBeZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__NftAlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

contract NftMarketplace is ReentrancyGuard {
    // `listItem` : List Nft Item on the marketplace
    // `buyItem` : buy Nft
    // `cancelItem` : cancel Listing
    // `updateListing` : update price
    // `withdrawProceeds` : get payments from sell

    //===============
    //Structures
    //
    //===============

    //Listing structure containing price and seller of an NFT
    //using that type we don't have to write 2 mapping for connecting an nft to its price and to its seller
    struct Listing {
        uint256 price;
        address seller;
    }

    //===============
    //State Variables
    //===============

    //mapping of address to nft contract address of a tokenId to the listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;

    // mapping of seller addresses to amount earned
    mapping(address => uint256) private s_proceeds;

    //==============
    // Modifiers
    //==============
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__NftAlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    //==============
    // Events
    //==============
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 indexed tokenId);

    //==============
    //Main Functions
    //==============

    /*
     * @notice Method for your nft to sell on the marketplace
     * @param nftAddress: nft contract
     * @param tokenId: nft contract's tokenId
     * @param price: price set for the sale
     * @dev Technically, we could have the contract being the escrow for the nfts,
     * @dev but it required people to make a transfert in first place instead of keeping the ownership while the nft is being listed.
     */

    // for listing, need Nft contract address, nft token ID, it's price
    // probably better to access it externally from another project / account
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        // can't list if price is less than 0
        if (price <= 0) {
            revert NftMarketplace__PriceMustNotBeZero();
        }
        // there is 2 way for listing an NFT
        //1. send Nft to the NftMarketplace contract to have it hold and list the nft for sell
        // require a Nft transfer even if not sold
        //2. have the owner signing an approval with the NftMarketplace contract to give it access to their Nft
        // when sold and start transferring to the next owner. least intrusive, and owner can still hold their nft
        // => using method 2 requiring ERC721 interface from openZeppelin to use the getApproved function.

        //call on IERC721
        // if the nft contract of a specific token Id  is not approved by this contract address
        // then revert listing
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }

        // then a datastructure to list Nft's, array or mapping.
        // => use of mapping

        //update the mapping nft contract address' tokenId to it's price and the sellet -> msg.sender
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);

        //emit an event after update
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) nonReentrant {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
        }

        s_proceeds[listedItem.seller] = s_proceeds[listedItem.seller] + msg.value;

        //delete from the listing mapping purchased items
        delete (s_listings[nftAddress][tokenId]);
        //transfert the NFT
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);

        //emit an event too make sure Nft has been transfered
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function cancelListing(
        address nftAddress,
        uint256 tokenId
    ) external isOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId) {
        delete s_listings[nftAddress][tokenId];
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId) {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }

        s_proceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    //==============
    //Getter Functions
    //==============

    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[msg.sender];
    }
}
