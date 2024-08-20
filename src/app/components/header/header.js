"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import imgCGT from "../../../../public/assets/logoCGT.jpg";
import api from "../../utils/axios"; // Vérifie que le chemin est correct
import { FaBars, FaTimes } from 'react-icons/fa';
import './header.css'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    const checkAuth = async () => {
      if (token) {
        try {
          // Vérifier si le token est valide en l'envoyant au backend
          await api.post("/verify-token", { token });
          setIsAuthenticated(true);
        } catch (error) {
          if (error.response && error.response.status === 401 && refreshToken) {
            // Utiliser le refresh token pour obtenir un nouveau token
            try {
              const response = await api.post("/refresh-token", {
                refreshToken,
              });
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
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []); // [] signifie que cela ne se déclenche qu'au montage du composant

  return (
    <div className="navbar-with-img">
      <div className="image-navbar">
        <Link href="/"><Image
          layout="responsive"
          placeholder="blur"
          src={imgCGT}
          width="200"
          height="200"
          alt="logo blanc du syndicat CGT sur fond rouge"
        /></Link>
      </div>

      {/* Icône de menu hamburger visible sur mobile */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <nav className={`navbar ${menuOpen ? 'open' : ''}`}>
        <Link href="/">Accueil</Link>
        <Link href="/vieSyndicale">Vie Syndicale</Link>
        <Link href="/documents">Documents</Link>
        <Link href="/contact">Contact</Link>
        {isAuthenticated ? (
          <>
            <Link href="/profil">Profil</Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                setIsAuthenticated(false);
                router.push("/connexion");
              }}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <Link href="/connexion">Connectez-vous</Link>
        )}
      </nav>
    </div>
  );
}
