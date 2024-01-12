import "@/styles/globals.css"
import { MoralisProvider, useMoralisCloudFunction } from "react-moralis"
import Header from "../components/header"
import Head from "next/head"
import { NotificationProvider } from "web3uikit"
//constant for env variables
const APP_ID = process.env.NEXT_PUBLIC_APPLICATION_ID
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL

// MoralisProvider initializeOnMount equal false at the start as we dont use moralis server from the beginning
export default function App({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>NFT Marketplace</title>
                <meta name="description" content="NFT Marketplace" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
                <Header />
                <Component {...pageProps} />
            </MoralisProvider>
        </div>
    )
}
