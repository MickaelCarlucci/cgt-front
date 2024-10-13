"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import Navbar from "./components/header/header";
import NavAdmin from "./components/adminNav/adminNav";
import Footer from "./components/footer/footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/Loader/Loader";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  // Enregistrement du Service Worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker enregistré avec succès:", registration.scope);
          })
          .catch((error) => {
            console.error("Échec de l'enregistrement du Service Worker:", error);
          });
      });
    }
  }, []);

  return (
    <html lang="fr">
      <Head>
        {/* Meta tags pour la PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <title>Syndicat CGT Teleperformance</title>

        {/* PWA configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/assets/icons/icon-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/assets/icons/icon-512x512.png"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <body className={`${inter.className} container`}>
        <SessionProvider>
          <AuthWrapper>
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
          </AuthWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}

function AuthWrapper({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (status === "authenticated" && session) {
        const now = Date.now();
        const tokenExpiration = new Date(session.expires).getTime();

        if (now >= tokenExpiration) {
          try {
            const response = await fetch("/api/auth/refresh-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken: session.refreshToken }),
            });

            if (!response.ok) {
              throw new Error("Erreur lors du rafraîchissement du token.");
            }

            const data = await response.json();
          } catch (error) {
            console.error(
              "Erreur lors du rafraîchissement automatique du token :",
              error
            );
            signOut({ callbackUrl: "/auth" });
          }
        }
      }
    };

    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 10 * 60 * 1000); // Vérifier toutes les 10 minutes

    return () => clearInterval(interval);
  }, [session, status]);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/auth" });
    }
  }, [status, session, router]);

  if (status === "loading") return <Loader />;

  return <>{children}</>;
}
