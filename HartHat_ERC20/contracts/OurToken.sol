//SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

// import ERC20 contract, and inherit all the function

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OurToken is ERC20 {
    // in sort to inherit ERC20 we have to use the ERC20 token constructor

    constructor(uint256 initialSupply) ERC20("OurToken", "OT") {
        //first we need to mint tokens using the ERC20 contract function _mint else initial supply is 0
        // the mint transaction sender is the owner
        _mint(msg.sender, initialSupply);
    }
}
