// Lottery - Raffle system
/*
- gas wise
- keep track of players + getPlayer array function
- Pay with native Token to enter lottery round + getEntranceFee function
- see prive of entrance fee
- pick random verifiably winner -> chainlink vrf
- new round every X amoount of time
- needs of chainlink oracles for -> randomness, Auto trigger execution(chainlink keepers), Randomness
*/

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//import VRF
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
// import coordinator interface
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

//import keepers
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

/* CUSTOM ERRORS */
error Raffle__NotEnoughEthPaidToEnter();
error Raffle__TransfertFailed();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /* TYPES DECLARATION */
    //enum secretely is an uint256 where 0 is open and 1 calculating
    enum RaffleStates {
        OPEN,
        CALCULATING
    }
    /* STATES VARIABLES */
    //set entrance fee private and immutable, i_ variable
    uint256 private i_entranceFee;

    // players array, storage variable
    address payable[] private s_players;

    //VRF Coordinator
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    // requestRandomWords parameters
    bytes32 private immutable i_gasLane; //keyhash
    uint64 private immutable i_subscriptionId; // subscriptionId
    uint32 private immutable i_callbackGasLimit; // max gas to pay when requesting(200, 500 or 1000)

    // as those 2 parameters are constants and cant be changed, no need to set them up in constructor for a new value
    uint16 private constant REQUEST_CONFIRMATIONS = 3; // 3 confirmations from chainlink node
    uint32 private constant NUM_WORDS = 1; //number of random number requested

    //Lottery Variables, States, winners etc...
    address private s_recentWinner;
    RaffleStates private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 immutable i_interval;

    /* EVENTS */
    // event, name of the event(up to 3 topics)
    event RaffleEnter(address indexed player);
    event RequestRaffleWinner(uint256 indexed requestId);
    event winnerPicked(address indexed winner);

    constructor(
        address vrfCoordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleStates.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    //Enter the raffle, allow anyone to send value -> public and payable
    function enterRaffle() public payable {
        //Pay to enter else can't enter
        // can use -> require (msg.value > i_entranceFee, "didnt paid enough")
        // or
        // custom error messages thats are more gas efficient
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughEthPaidToEnter();
        }

        //if raffle not open, can't enter
        if (s_raffleState != RaffleStates.OPEN) {
            revert Raffle__NotOpen();
        }
        // push the adress who paid to the player list
        s_players.push(payable(msg.sender));
        /*
        when we update a dynamic object like an array or a mapping, we always want to emit an event
        */
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev That is the function that the chainlink keepers node call
     * looking for the 'upkeepNeeded' to return True
     * The following should be true in order to return true:
     * - Time interval should have passed
     * - lottery should have at least 1 player and some eth
     * - subscription should be funded with link
     * - Lottery should be in an open state.
     * meaning when choosing randomNumber no other players should be able to join the lottery
     *
     * @dev the parameter checkData allows us to specify any trigger logic we want
     * @dev like calling other functions as well
     * @dev but similar to requestId parameter we comment it out.
     * @dev as we are not going to use it but still needs to be of type bytes calldata
     * @dev - changed external for public to be able to call it inside the contract
     */
    function checkUpkeep(
        bytes memory /*checkData*/
    ) public view override returns (bool upkeepNeeded, bytes memory /* performData*/) {
        //check lottery status
        bool isOpen = (RaffleStates.OPEN == s_raffleState);
        //check interval - time passed
        //(block.timestamp - last block timestamp) > interval
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        // check if enough players
        bool hasPlayers = (s_players.length > 0);
        // check eth amount in contract
        bool hasBalance = address(this).balance > 0;

        //Then check if all is true if it is, upkeepNeeded will be true
        // then it will be time to end the lottery for a new round
        // has upkeepNeeded is initialized as boolean in parameters doesnt need it down here
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "");
    }

    // pick a  random winner using VRF, external function are a bit cheaper than public
    // changed requestRandomWinner to performUpkeep, external override
    function performUpkeep(bytes calldata /*performData */) external override {
        (bool upkeepNeeded /*performData */, ) = checkUpkeep(""); //empty calldata
        if (!upkeepNeeded) {
            // pass variables to check to knows the reasons
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        //set raffle state to calculating, not open
        s_raffleState = RaffleStates.CALCULATING;

        // request the random number
        // when we get it, do something
        // total of 2 transactions to avoid spoof or fakeout
        // request random number from fulfillRandomWords() from VRF consumer
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        //emit the event for requestId
        // actually it is redundant because, in VRF contract there is also an event emitting the requestID
        // at this function -> RandomWordsRequested
        // can be deleted but will not be for purpose of not refactoring test
        emit RequestRaffleWinner(requestId);
    }

    // internal override, to override the existing one from VRF consumer
    // original is internal virtual. Expecting to be overriden
    // parameters, requestid + a memory array randomwords
    function fulfillRandomWords(
        uint256 /*requestId*/,
        uint256[] memory randomWords
    ) internal override {
        // modulo players.length with randomWords
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        //re-open lottery
        s_raffleState = RaffleStates.OPEN;
        // reset players array and timestamp to current block
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        // recent winner picked send money, and no data in the transaction
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        // if not success revert with custom error
        if (!success) {
            revert Raffle__TransfertFailed();
        }

        // emit winner
        emit winnerPicked(recentWinner);
    }

    /* VIEW / PURE FUNCTIONS */
    /* GETTER FUNCTIONS */
    // get entrance fee price
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    // get the list of players by index
    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    // get last winner
    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    //get number of players
    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    //get last block
    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    //get interval
    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    //get raffle status
    function getRaffleState() public view returns (RaffleStates) {
        return s_raffleState;
    }

    // get how many random words
    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    // get how many confirmations required
    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    // when receive get a call from outside it redirect to the fund function
    //  receive function
    receive() external payable {}

    // fallback function
    fallback() external payable {}
}
