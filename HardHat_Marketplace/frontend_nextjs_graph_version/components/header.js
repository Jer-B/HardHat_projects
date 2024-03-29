import { ConnectButton } from "web3uikit"
import Link from "next/link"
//moralisAuth to false to not automatically connect to moralis database, just to metamask
export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h1 className="py-4 px-4 font-bold text-3sl">NFT-Marketplace</h1>{" "}
            <div className="flex flex-row items-center">
                <Link href="/" className="mr-4 p-6">
                    Home
                </Link>
                <Link href="/sell-nft" className="mr-4 p-6">
                    Sell-NFT{" "}
                </Link>

                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
