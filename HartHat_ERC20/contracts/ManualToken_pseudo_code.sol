//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ManualToken {
    //An easy way to visual how works ERC20:
    /**
     * There is some balances mapping, from an address to an uint256 generally called balanceOf
     *
     * We need to always keep track of balances, for transfers.
     * when a transfer occurs actually, it substract the amount to transfert fron one address,
     * and add it to another one.
     * from point A to point B.
     *
     * Now let say we also want the tokens to be usable for deposit, custom periodic transfer,
     * transfer for another value, stacking, governance etc...
     * it will require a function that sort of approve those kind of special events transfer.
     * linked to a mapping that will tell from who, or which address the transfer is allowed for
     * how much amount
     *
     */

    mapping(address => uint256) public balanceOf;

    //a mapping of addresses to a mapping of addresses to an amount
    mapping(address => mapping(address => uint256)) public allowance;

    function _transfer(address from, address to, uint256 amount) public {
        //balanceOf[from] -= amount;
        balanceOf[from] = balanceOf[from] - amount;
        balanceOf[to] += amount;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // implement taking funds from a user
        // check if user allowed that transfer if yes, does it
        require(_value <= allowance[_from][msg.sender]); //check allowance
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }
}
