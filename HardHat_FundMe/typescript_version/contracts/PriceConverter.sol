//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// this contract will be used as a library that we will attach to an uint256
// for let say be able to even use msg.value as it was an object, array, struct or even a function and be able to call function on it.
// like -> msg.value.GetPrice();
// library function should be internals
// library global frame start with library not contract
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    //function to get the price of eth
    //get price in term of usd

    /*
    REFACTOR Lesson 7 Step2 (step 1 is at the bottom)

    - added the AggregatorV3Interface of priceFeed parameter
    - which allow us to delete the hardcoded price feed initialy written in this function
    - commented it, step 3 inside the function
     */
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // since we are interacting with something outside of this contract we need two things:

        // I.The ABI
        // to get the ABI there is multiple way:
        // 1. import the whole code of the other contract in ours.
        //  But we dont need to include all functions, we can just include what we need.
        // 2. There is a concept in solidity called Interface.
        //  https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol
        // Let's look at AggregatorV3Interface, there is function without their logics.
        // If we compile AggregatorV3Interface, we can get its ABI.
        // So if we copy the code of it and paste it in this contract we can work with its ABI.
        // remember in one contract we can have multiple contracts if they re well defined in their own contract{} declatarion.
        // So doing so allow us to do something like this:
        // AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e).version()
        // AggregatorV3Interface at that address, and if both can work together then we can call any functions without errors, so let try to call version of aggregator at this address.
        /* A More detailed image of that exemple
           function getVersion() public view returns (uint256) {
               // Make an object of type AggregatorV3Interface (the contract), called priceFeed, with values of Aggregator at the Goerli address of ETH/USD
               AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
               // And return an uint256 of the version of priceFeed, wich is the same way to ask the version as it is The aggregator at the ETH/USD address, just put into one variable / object.
               return priceFeed.version();
           }
           This is an easy way for us to interact with contracts that exist outside of ours.
        */
        // 3. we can also import the contract at the top -> import "./AggregatorV3Interface.sol"
        // and create a local contract named the same containing its code.
        // 4. or we can directly import from github and npm (package manager)
        // if we look at the doc of chainlink interfaces its explained how to. remix is smart enough to understand it.
        // import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

        // 5. there is a way to interact with any contract without the ABI but for now let stick to the ABI normal ways as above.

        // II.The contract address to interact with
        // ETH/USD goerli contract address 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e

        /*
        REFACTOR Lesson 7 Step3 (step 2 is at the top)

        -comment priceFeed, so no more hardcoded addresses
        */

        // so here is our contact to aggregator contract
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // );

        // from which we call latestRoundData and values we want to keep and return
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // eth in terms of usd as we speak
        // 126000000000 -> 8 decimals on this price feed so -> 1260.00000000
        // return the price, but our msg.value is an uint so it also need to be casted as an uint, also it needs 10 more decimals to match those 18 from msg.value in wei
        return uint256(price * 1e10); // 1e10 = 1 raised to the 10th -> 10000000000
        // then change the function type to view and to returns that uint256
    }

    function getVersion() internal view returns (uint256) {
        // Make an object of type AggregatorV3Interface (the contract), called priceFeed, with values of Aggregator at the Goerli address of ETH/USD
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        // And return an uint256 of the version of priceFeed, wich is the same way to ask the version as it is The aggregator at the ETH/USD address, just put into one variable / object.
        return priceFeed.version();
    }

    //function to get the conversion rate
    // as input, an uint256 of ethAmount, public view returning an uint256

    /*
    REFACTOR Lesson 7 Step 1

    - added a new parameter to the getConversionRate, of type AggregatorV3Interface named priceFeed
    - now when we call the getPrice function we pass the priceFeed to it
     */
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        //call getPrice and attribute the value to a variable
        uint256 ethPrice = getPrice(priceFeed);
        // multiply and add first in solidity then divide.
        // divide by 1e18 because else it will get 36 decimals
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
