//refactored for JS / TS deployment, Lesson 7
// kept comments, removed some, added new ones

// what the contract do:
// Allow users to fund and withdraw
// a minimum value to fund
// convert the fund amount to a USD value equivalent
// only owner can withdraw
// keep tracks of who fund, arrays list and struct

// SPDX-License-Identifier: MIT
// License
pragma solidity ^0.8.8;
//imports
import "./PriceConverter.sol";
//errors
// Style convention reformat NotOwner() -> FundMe__NotOwner()
error FundMe__NotOwner();

//interfaces
//libraries

/*
for gas efficiency change require statements and their custom error message which are arrays of string
saved into memory, into if statements and revert condition.
to do so we declare the error code outside the contract scope then change require statements into if + revert
    gas before : 759,956  
    gas after : 734,929
*/

//contracts
contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // let set a minimum value using chainlink in USD, 50$
    // upgrade to 18th
    // uint256 public MINIMUM_USD = 50 * 1e18;
    // if eth is 1260 do 50 / 1260 = eth amount to input for funding

    // gas efficient solution
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    /*
    Constant variables are ALL CAPS
    When a variable is set globally with no purpose ever to change it can be set to constant
    doing so the variable will not occupy a storage spot no more. Memory allocation on the blockchain
    lower computation, lower gas
    gas before : 803,089 
    gas after : 783,523 
    gas before and after constant on that function call only can change from few cents to a whole dollar depending of the price of ether
    */

    //State Variables
    // funders arrays. an array of addresses public called funders
    address[] public funders;
    // mapp which addresses funded with what amount
    mapping(address => uint256) public addressToAmountFunded;

    // OnlyOwner constructor
    // it is a function called immidiatly after the contract is being deployed

    // global variable of an address called owner
    //address public owner;

    // gas efficient solution
    address public immutable i_owner;

    /*
    immutables variables are specified immutable and the variables starts by i_
    When a variable is set once outside of the line whre they are declared, they are set as immutable
    like for constructors
    gas before : 783,523  
    gas after : 759,956
    gas before and after immutable on that function call only can change from few cents to a whole dollar depending of the price of ether
    */

    // immutable and constant are saved directly into the bytecode of the contract instead of in a storage slot.

    /*
    REFACTOR LESSON 7 step 0 (next step is in priceconverter.sol)

    - added a pricefeed parameter to the constructor, which use a global variable containing an address
    address will change depending of the network we use.
    change made for it
    - added parameter to getConvertionRate, which use the getPrice function to which
    the parameter of priceFeed is also added.
    Allowing to delete the hardcoded initial priceFeed address that was in getPrice()
    since it is now a global variable
    */

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        //set owner to the contract deployer address
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // want everybody to be able to fund the contract -> function public payable
    // needs to be payable to allow transaction with the functions for a deposit
    function fund() public payable {
        // now we can do this
        // msg.value.getConversionRate(); // secretly the same as -> getConversionRate(msg.value);

        // if compiling with the line under will get an error as
        // because in our library at the getConversionRate function,
        // the first parameter it use will be the object on itself, will use msg.value for msg.value.
        // require(getConversionRate(msg.value) >= MINIMUM_USD, "Not sufficient amount for funding, 1 eth minimum."); //1e18 is the same as 1*10**18 -> 100000000000000000000
        // so we need to change it for :
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Not sufficient amount for funding, 1 eth minimum."
        ); //1e18 is the same as 1*10**18 -> 100000000000000000000
        // we are not passing a variable to getConversionRate because msg.value is considered to be the first parameter due to be imported as a library.
        // so if getConversionRate requires a parameter as input it will use that one first.
        // if it requires another parameter or more, those will need to be put into getConversionRate parenthesis.
        // msg.value.getConversionRate(param2, param3, etc...)

        // each time someone funds add to the the array
        funders.push(msg.sender);
        // show how much has been funded from that sender
        addressToAmountFunded[msg.sender] = msg.value;
    }

    // function for withdrawing
    function withdraw() public onlyOwner {
        // after withdrawing put back to zero the amount funded by that wallet address
        // loop through the array for this

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex = funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        // reset the array, 2 ways
        // loop through each element and delete it one by one
        // or refresh it to a zero state as a new array of 0
        funders = new address[](0);

        // withdraw from a contract, 3 ways for doing so.
        // transfer, send, call

        // transfert is the simplest and makes the most sense at this level
        // transfer to the sender(like the requester here) at this contract balance
        // works only for payable address.
        //msg.sender is of type address
        // where payable(msg.sender) is of type payable address, so we just wrap into the payable type caster
        //payable(msg.sender).transfer(address(this).balance);

        //transfer details:
        /*
        Auto revert
        a normal transaction is capped at 2100 gas fee, transfer is capped at 2300
        if more gas fee is used on transfer it will throw an error and revert the transaction
        */

        //bool sendSuccess = payable(msg.sender).send(address(this).balance);
        //require(sendSuccess,"Send failed");

        //send details:
        /*
        Needs a boolean and require statements for reverting
        send is also capped at 2300, but if it errors it return a boolean, success or not, transaction doesn't revert.
        to have it reverting it need a boolean state that require true or false, success or failure. which allow a revert condition
        */

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
        //call details:
        /*
        Low level command.
        It is the most powerfull and allow  to call any function on the whole Ethereum space
        without the need to have the ABI. 
        For now we stay at the stage of balance transactions and we'll get to it later.
        Similar to send for its structure.
        first parenthesis following is used for calling a function
        
        calls particularity:
        No cap gas
        calls allow us to call any function on ethereum without its ABI, so it own a structure considering that
        here we leave it blank -> ("")
        to have it working as a value of a transaction we need to call that value and input what we want into it,
        can be done using curly brackets before any function call.
        -> {value: address(this).balance}("")
        so calls return actually 2 variables, curly brackets one and parenthesis one.
        so on the left hand side it needs to be adhusted for 2 variables, 
        the way to attribute two variables is the same as the getprice function, into parenthesis coma separated.
        -> (bool callSuccess, bytes memory dataReturned) =
        it returns a boolean checking true or false and where the function call is saved. as it is saved in a byte object it needs to be put in memory.
        but as we dont need the second one it can be deleted and leave the coma like for getPrice function earlier.
        ->  (bool callSuccess,) =
        then add a require statements for the boolean to be attributed to something.
        */

        // for the most parts, call is the best practice, it can be case by case.
    }

    //Modifier
    /*
    quick way to have a onlyowner logic into withdraw() is to set a requirement
    require(msg.sender == owner, "Not the owner!");

    or to set a modifier having the same  requirement in a separate place, allowing then to be able to put that modifier 
    in any function declaration easily.
    modifier are set at the bottom of the code and last line of it must end by -> _;
    allow to do this after -> function withdraw() public onlyOwner{blablabla}

    in the logic it will read withdraw declaration then stop at onlyowner, look at the modifier
    do everything that is inside the modifier then do restart reading where it stopped  when it meet the _; in the modifier.
    so it will start reading again at the withdraw declaration at the onlyOwner position.
    */

    //modifier, should be after state variables and events
    modifier onlyOwner() {
        //require(msg.sender == i_owner, "Not the owner!");

        // if solution for gas efficiency using custom errors from the top
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // add receive and fallback to prevent when someone is trying to send Eth directly without interacting with any other functions.
    // like a default interaction case.

    // when receive get a call from outside it redirect to the fund function
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
