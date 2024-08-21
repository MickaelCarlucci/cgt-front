'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import Navbar from "./components/header/header";
import Footer from "./components/footer/footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Syndicat CGT Teleperformance</title>
      </Head>
        <body className={`${inter.className} container`}> 
          <SessionProvider>  
          <Navbar />
          {children}
          <Footer />
          </SessionProvider> 
        </body>
    </html>
  );
}
