import Head from "next/head"
import Image from "next/image"
//import { Inter } from "next/font/google";
import styles from "../styles/Home.module.css"
//import ManualHeader from "../components/ManualHeader";
import Header from "../components/Header"
import LotteryEntrance from "../components/LotteryEntrance"
//const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    return (
        <>
            <Head>
                <title>Smart Contract Raffle</title>
                <meta name="description" content="Raffle front-end" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {/* this is how react does comments. 
import header like this or by using the one auto closing tag way
<Header></Header> */}
            {/**<ManualHeader /> */}
            <Header />
            <LotteryEntrance />
        </>
    )
}
