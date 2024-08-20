import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/header/header"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>CGT Teleperformance</title>
      </Head>
      <body className={`${inter.className} container`}>
        <NavBar />
        {children}
        </body>
    </html>

  
  );
}
