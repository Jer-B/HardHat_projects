//to do
// - have a function to enter the lottery
// - make a button of it to enter it
// - get ABI, contract adress, function to use, value to send. using UseWeb3Contract
// - for abi and contract make into a constants folder, json files which gets their data when deploying the contract
// - have that data auto updating depending on which chain it is deployed to
// - getentrancefee and display it aside a button to enter the lottery
// - show notification of transaction when entering lottery
// - show number of player and amount of eth in the contract of the raffle

import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
//import abi from "../constants/abi.json"
//import contractAddresses from "../constants/contractAddresses.json"
//or
import { abi, contractAddresses } from "../constants"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    // pull chainId from useMoralis, then rename it to chainIdHex
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    console.log("ChainId is :", parseInt(chainIdHex))
    // then make a new variable of the chainId
    const chainId = parseInt(chainIdHex)

    // if chainId in the addresses list grab it, else it is null
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    //show entrance fee on the UI, making the entranceFee a global variable just like this
    // is good enough to get it and output it in a console.
    // in useEffect it isn't re-rendering when it gets to it. so we won't see it on the UI
    // to have react re-rendering, when getting the entranceFee, we can use the State hook from react
    //    let entranceFee = ""

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables

    //var name entranceFee, set first state of entranceFee to 0 on the setEntranceFee function
    const [entranceFee, setEntranceFee] = useState("0")

    //state of getNumberOfPlayers
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")

    //state of getRecentWinner
    const [recentWinner, setRecentWinner] = useState("0")

    // useNotification
    // it gets something back called the Dispatch, like a little popup
    const dispatch = useNotification()

    //grab runContractFunction from useWeb3Contract, running enterRaffle function of the raffle.sol contract
    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi, // abi from abi.json
        contractAddress: raffleAddress, // contract Addresses of specified chainId from contractAddresses.json and MoralisProvider datas grabbed from metamask
        functionName: "enterRaffle",
        params: {}, // no parameters to use this time
        msgValue: entranceFee, // the entrance fee
    })

    /**
     * as runContractFunction takes no params value for this time, we are going to fill
     * the msgValue value with the entranceFee value.
     * -- Notice that runContractFunction can both send transactions and read state of a transaction
     *
     * Back in raffle.sol we did set entranceFee dynamically, so we are going to run a function
     * that reads the entranceFee and pass it to msgValue
     *
     * to do that we we're gonna use useeffect(), which can run when something changes.
     * and try to get the value of entranceFee if web3 is enabled by using the runContractFunction functions from useWeb3Contract hook.
     *
     */

    // try to read entranceFee

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi, // abi from abi.json
        contractAddress: raffleAddress, // contract Addresses of specified chainId from contractAddresses.json and MoralisProvider datas grabbed from metamask
        functionName: "getEntranceFee",
        params: {}, // no parameters to use this time
        // no msgValue, and it is optional to use it
        // msgValue: ,// the entrance fee
    })

    // getnumber of players
    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi, // abi from abi.json
        contractAddress: raffleAddress, // contract Addresses of specified chainId from contractAddresses.json and MoralisProvider datas grabbed from metamask
        functionName: "getNumberOfPlayers",
        params: {}, // no parameters to use this time
        // no msgValue, and it is optional to use it
        // msgValue: ,// the entrance fee
    })

    // getRecentWinner
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi, // abi from abi.json
        contractAddress: raffleAddress, // contract Addresses of specified chainId from contractAddresses.json and MoralisProvider datas grabbed from metamask
        functionName: "getRecentWinner",
        params: {}, // no parameters to use this time
        // no msgValue, and it is optional to use it
        // msgValue: ,// the entrance fee
    })

    //pulled the whole function out of useEffect to have our UI rerendering
    // through the handleSuccess check on transactions. that when successfull, will call
    // updateUI function that will pass the change to useEffect for re-rendering
    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numberOfPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = (await getRecentWinner()).toString()
        setEntranceFee(entranceFeeFromCall)
        setNumberOfPlayers(numberOfPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
        // very large number, parse it using ethers
        console.log("Entrance Fee: ", entranceFeeFromCall)
        console.log("Number of Players: ", numberOfPlayersFromCall)
        console.log("Recent Winner: ", recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            // first time it runs isWeb3enabled is false, we need to turn it to true by running the dependencies array first
            // get the entrance fee first then do the the rest once we get it
            updateUI()
        }
    }, [isWeb3Enabled]) // turn isWeb3Enabled to true
    // {Note} from this point, entranceFee will return an error if the contract on the selected chain doesnt exist
    // so make sure it try to get it only if the adress exist
    // and add a button and use a notification for the user to knows about their transaction states
    // it is important to handle errors with onError, event on read runContractFunction because
    // if one of them breaks, we won't know, so add this to any runContractFunction ->onError: (error) => {console.log(error)},

    //handleSuccess
    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        //parameters can be found on web3UiKit site, it is just the visual design of the notification
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }
    return (
        <div className="p-5">
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => {
                                    console.log(error)
                                },
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {/** when is loading or fetching show a spinning "waiting circle" */}
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>
                        Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether").toString()}
                    </div>
                    <div>Current number of players: {numberOfPlayers}</div>
                    <div>Last Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No raffle address detected, can't get entranceFee</div>
            )}
        </div>
    )
}
