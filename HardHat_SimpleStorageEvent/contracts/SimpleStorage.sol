//SPDX-License-Identifier: MIT
// SimpleStorage Event version

pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 favoriteNumber;

    //event
    event storedNumber(
        uint256 indexed oldNumber,
        uint256 indexed newNumber,
        uint256 addedNumber,
        address sender
    );

    // store function
    function store(uint256 _favoriteNumber) public {
        //emit the event
        emit storedNumber(
            favoriteNumber,
            _favoriteNumber,
            _favoriteNumber + favoriteNumber,
            msg.sender
        );

        favoriteNumber = _favoriteNumber;
    }

    // retrieve function
    function retrieve() public view returns (uint256) {
        return favoriteNumber;
    }
}
