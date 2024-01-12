import "../styles/globals.css"
/* import moralisProvider and wrap the app in it */
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"

export default function App({ Component, pageProps }) {
    return (
        /*wrap the app into MoralisProvider */
        /* initializeOnMount is  the optionality to hook into a server 
      to add some more features. as we don't need to hook into a server for this application
      set it to false */
        <MoralisProvider initializeOnMount={false}>
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
    )
}
