'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import Navbar from "./components/header/header";
import NavAdmin from "./components/adminNav/adminNav";
import Footer from "./components/footer/footer";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
          <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
          <Navbar />
          <NavAdmin />
          {children}
          <Footer />
          </SessionProvider> 
        </body>
    </html>
  );
}
