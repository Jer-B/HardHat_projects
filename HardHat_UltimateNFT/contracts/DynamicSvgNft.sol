//SPDX-License-Identifier: MIT
//Change depending on the price of an asset

pragma solidity ^0.8.17;

//Extend to ERC721
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

//import base64 which comes with an encoder
import "../node_modules/base64-sol/base64.sol";

//import chainlink for price feed
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
    //token counter
    uint256 s_tokenCounter;

    // attribute a low and high images (through ipfs / on chain storage pass an url/ipfs to it)
    string private i_lowImage;
    string private i_highImage;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    string private constant base64EncodeJsonPrefix = "data:application/json;base64,";

    AggregatorV3Interface internal immutable i_priceFeed;

    // mapping of users to selected highValue for nft change at a certain price
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    //minting event
    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    // to change , svg needs to keep tracks of 2 values in memory, initialize those in first at deployments
    constructor(
        address priceFeedAddress,
        string memory LowSvg,
        string memory HighSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        i_lowImage = svgToImageUri(LowSvg);
        i_highImage = svgToImageUri(HighSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // convert svg to base64
    function svgToImageUri(string memory svg) public pure returns (string memory) {
        //encode Svg to Base64
        string memory base64Encoder = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, base64Encoder));
    }

    //function to mint freely
    function mintNft(int256 highValue) public {
        // high value of the token id set to the inputed parameter
        s_tokenIdToHighValue[s_tokenCounter] = highValue;

        //allow users to set a price at minting time for when the NFT should change picture
        _safeMint(msg.sender, s_tokenCounter);
        // update counter
        s_tokenCounter += 1;
        //emit event
        emit CreatedNFT(s_tokenCounter, highValue);
    }

    // baseUri function from ERC721 overriden
    function _baseURI() internal pure override returns (string memory) {
        return base64EncodeJsonPrefix;
    }

    //base64 token URI

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // check if token uri exist, _exists is a ERC721 function
        require(_exists(tokenId), "URI query for non-existing token");
        // if (!_exists(tokenId)) {
        //     revert ERC721Metadata__URI_QueryFor_NonExistentToken();
        // }
        //imageUri mock for test
        //string memory imageUri = "hi";

        //i_priceFeed
        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        // depending on price change image URI, if above show high image, else show low image
        string memory imageUri = i_lowImage;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageUri = i_highImage;
        }

        // return a base64 version of the Json URI file
        // concatenate strings
        // get the name from the name() function of ERC721
        // base64 prefix for json files -> data:application/json;base64,

        //append prefix, and cast to string for not getting back the byte object

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    // type cast to a base64 encode
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An Nft changing depending on a Price feed value", ',
                                '"attributes": [{"trait_type": "Coolness", "value":100}], "image":"',
                                imageUri,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
