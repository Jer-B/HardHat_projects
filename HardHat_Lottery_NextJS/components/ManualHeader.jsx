/*import useMoralis */
import { useMoralis } from "react-moralis"
import { useEffect } from "react"

function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()
    {
        /**
         * use effect takes 2 things, a parameter and optionally a dependency array
         * running it in the below pattern due to strict mode, simulating a creation of effect
         * at first load and a destruction of them and re-create them.
         * so it can have a first previous state of components of that useEffect.
         * so that pattern will show at first load twice the values. hi, false, hi and false.
         *
         * after connection it will show, hi and true just once.
         *
         * running with no array, we can get a circular render. meaning at a value change,
         * it re-renders and if we have another useEffect re-rendering depending on that change,
         * it will loop in a re-render maze of things because the first useEffect will also
         * re-render at any change as nothing is specified as an array.
         *
         * if empty array it run just once
         *
         * if array, run and re-renders at any change
         *  */
    }
    {
        /*
    useEffect(() => {
        console.log("hi")
        console.log(isWeb3Enabled)
    }, [isWeb3Enabled])
    */
    }
    {
        /**
         * now we want to make sure it remember that we are connected and to not run if so
         * in that pattern below, it will popup metamask at each refresh.
         *
         */
    }
    {
        /*
    useEffect(() => {
        if (isWeb3Enabled) return enableWeb3()
    }, [isWeb3Enabled])
    */
    }
    {
        /** so to avoid this the right way is to use the browser localstorage to store into it states
         * so when clicking on connect let's also add a value into that storage to says that we are connected
         * window.localStorage.setItem("connected","injected")
         * that stores a new key value . and in useEffect let see if that key exist already or not
         * that will determined if it is connected or not already.
         *
         * note depending on next js version it can have hard time to knows about the window object
         * so we need also a check of typeof window is not undefined then check if the key exist
         * as below
         */
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            {
                /** let transform if condition in one statements
            if (typeof window !== "undefined") {
                if (window.localStorage.getItem("connected")) */
            }
            if (
                !isWeb3Enabled &&
                typeof window !== "undefined" &&
                window.localStorage.getItem("connected")
            ) {
                //if doesnt put enableWeb3() in a comment without the second useEffect()
                // a metamask popup will show up each time we refresh
                console.log("Wallet connected")
                enableWeb3()
            }
        }
        // commented parenthesis due to 1 statement change
        //}
    }, [])

    {
        /**
         * to avoid the permanent popup at refresh we need to use another useEffect()
         * to check to see if when we re-renders any accounts has changed
         * useMoralis() comes with that kind of check with the Moralis functionality
         * Moralis.onAccountChanged((account) => {})
         * which takes a function has parameter.
         *
         * then let assume that if account is un-existent => null
         * the wallet is disconnected so we remove the local storage key of "connected"
         * and deactivate web3, which is also a functionality from useMoralis()
         *
         * as below
         */
    }
    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`)
            if (account == null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account found, deactivating Web3")
            }
        })
    }, [])
    return (
        <div>
            {/*comment for react inside HTML contents */}
            {/**
             * since we are not using raw JS we needs brackets at onClick to be able to use raw JS
             */}
            {/*2 ways to manage states hook, variables - function from moralis, or core react hook called useEffect() */}
            {/*if account state from hook exist -> account ? (do this) : (else do that) */}
            {account ? (
                <div>
                    Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        // await walletModal.connect()
                        //change await enableWeb() storing it in a variable
                        const ret = await enableWeb3()
                        //add a check if ret is undefined or not
                        if (typeof ret !== "undefined") {
                            // depends on what button they picked
                            if (typeof window !== "undefined") {
                                window.localStorage.setItem("connected", "injected")
                            }
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}

export default ManualHeader

/* can also export the component inside the function declaration
like this :
export default function Header(){
  return <div>blabla</div>
}

*/
