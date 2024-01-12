import "@/styles/globals.css";
import { MoralisProvider, useMoralisCloudFunction } from "react-moralis";
import Header from "../components/header";
import Head from "next/head";
import { NotificationProvider } from "web3uikit";

import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

// initialize apollo client, same as apollo doc
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/49860/nft-marketplace/version/latest",
});
// MoralisProvider initializeOnMount equal false at the start as we dont use moralis server from the beginning
export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <NotificationProvider>
            <Header />
            <Component {...pageProps} />
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  );
}
