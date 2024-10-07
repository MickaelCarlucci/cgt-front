"use client";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import imgCGT from "../../../../public/assets/logoCGT.png";
import { FaBars, FaTimes, FaPowerOff } from "react-icons/fa"; 
import './header.css';

export default function Header() {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Charger le mode sombre depuis le localStorage
    useEffect(() => {
        const savedMode = localStorage.getItem("darkMode");
        if (savedMode === "true") {
            setDarkMode(true);
            document.body.classList.add("dark-mode");
        }
    }, []);

    // Appliquer la classe 'dark-mode' lorsque le bouton est cliqué et sauvegarder dans le localStorage
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "true");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "false");
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`navbar-with-img ${isScrolled ? "scrolled" : ""}`}>
            <div className="image-navbar">
                <Link href="/">
                    <Image
                        layout="responsive"
                        placeholder="blur"
                        src={imgCGT}
                        width="10px"
                        height="10px"
                        alt="logo blanc du syndicat CGT sur fond rouge"
                    />
                </Link>
            </div>

            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <nav className={`navbar ${menuOpen ? "open" : ""}`}>
                {/* Ajout du bouton pour basculer le mode sombre */}
                <div className="theme_switcher">
                    <label id="switch" className="switch">
                    <input className="dark-mode-toggle" onClick={toggleDarkMode} type="checkbox" /><span class="slider round" ></span>
                    </label>
                </div>
                <Link href="/">Accueil</Link>
                <Link href="/actualities">Actualités</Link>
                <Link href="/polls">Sondages</Link>
                <Link href="/documents">Documents</Link>
                <Link href="/contact">Contact</Link>

                {status === "authenticated" ? (
                    <>
                        <Link href="/profil">Profil</Link>
                        <button
                            className="button-red-off"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <FaPowerOff size={18} /> <span className="disconnect-text">Déconnexion</span>
                        </button>
                    </>
                ) : (
                    <Link href="/auth">Connexion</Link>
                )}

            </nav>
        </div>
    );
}
