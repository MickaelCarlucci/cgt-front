import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api from '../../utils/axios'

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        if (token) {
            // Vérifier si le token est valide en l'envoyant au backend
            api.post('/verify-token', { token })
                .then((response) => {
                    // Si le token est valide
                    setIsAuthenticated(true);
                })
                .catch(async (error) => {
                    // Si le token est expiré
                    if (error.response && error.response.status === 401 && refreshToken) {
                        // Utiliser le refresh token pour obtenir un nouveau token
                        try {
                            const response = await api.post('/refresh-token', { refreshToken });
                            const newAccessToken = response.data.accessToken;

                            // Mettre à jour le token dans le localStorage
                            localStorage.setItem("token", newAccessToken);

                            // Re-authentifier l'utilisateur
                            setIsAuthenticated(true);
                        } catch (refreshError) {
                            console.error("Le refresh token a échoué", refreshError);
                            setIsAuthenticated(false);
                        }
                    } else {
                        setIsAuthenticated(false);
                    }
                });
        } else {
            setIsAuthenticated(false);
        }
    }, []); // [] signifie que cela ne se déclenche qu'au montage du composant
   
  return (
    <nav>
    <Link href="/">
        <a>Accueil</a>
    </Link>
    <Link href="/vieSyndicale">
        <a>Vie Syndicale</a>
    </Link>
    <Link href="/documents">
        <a>Documents</a>
    </Link>
    {isAuthenticated ? (
        <>
            <Link href="/profil">
                <a>Profil</a>
            </Link>
            <button onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                setIsAuthenticated(false);
                router.push("/connexion");
            }}>Déconnexion</button>
        </>
    ) : (
        <Link href="/connexion">
            <a>Connectez-vous</a>
        </Link>
    )}
</nav>
  );
}
