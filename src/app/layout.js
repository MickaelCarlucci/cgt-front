"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./store";
import Navbar from "./components/header/header";
import NavAdmin from "./components/adminNav/adminNav";
import Footer from "./components/footer/footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/Loader/Loader";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  loginWithLocalStorage,
  setUser,
  clearUser,
  setLoading,
  logoutUser,
} from "./utils/authSlice";
import { firebaseAuth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <title>CGT Teleperformance France</title>
        <meta
          name="description"
          content="Site regroupant toutes les informations pour les salariés de l'entreprise Teleperformance France diffusé par le syndicat de la CGT"
        />
      </Head>
      <body className={`${inter.className} container`}>
        <Provider store={store}>
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
        </Provider>
      </body>
    </html>
  );
}

function AuthWrapper({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true));

      const expirationTime = localStorage.getItem("sessionExpiration");
      if (expirationTime && Date.now() > parseInt(expirationTime, 10)) {
        localStorage.removeItem("sessionExpiration");
        dispatch(logoutUser());
        router.push("/auth");
        return;
      }

      const firebaseAuthKey = Object.keys(localStorage).find((key) =>
        key.startsWith("firebase:authUser")
      );

      if (firebaseAuthKey) {
        dispatch(loginWithLocalStorage());
      } else {
        const unsubscribe = onAuthStateChanged(
          firebaseAuth,
          async (firebaseUser) => {
            if (firebaseUser) {
              const token = await firebaseUser.getIdToken();

              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/users/verify-token`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                  }
                );
                const data = await response.json();

                if (!response.ok) throw new Error(data.error);

                dispatch(setUser(data.user));
              } catch (error) {
                console.error("Erreur de validation du token :", error);
                dispatch(clearUser());
                router.push("/auth");
              }
            } else {
              dispatch(clearUser());
              router.push("/auth");
            }
          }
        );

        return () => unsubscribe();
      }

      dispatch(setLoading(false));
    };

    initializeAuth();
  }, [dispatch, router]);

  if (loading) return <Loader />;

  return <>{children}</>;
}
