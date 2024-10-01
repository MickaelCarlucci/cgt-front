"use client";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import imgCGT from "../../../../public/assets/logoCGT.png";
import { FaBars, FaTimes, FaPowerOff } from 'react-icons/fa';
import './header.css';

export default function Header() {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false); // State pour suivre le scroll

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) { // Ajouter la classe après un scroll de 50px
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`navbar-with-img ${isScrolled ? 'scrolled' : ''}`}> {/* Ajoute la classe scrolled en fonction du scroll */}
            <div className="image-navbar">
                <Link href="/"><Image
                    layout="responsive"
                    placeholder="blur"
                    src={imgCGT}
                    width="10px"
                    height="10px"
                    alt="logo blanc du syndicat CGT sur fond rouge"
                /></Link>
            </div>

            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <nav className={`navbar ${menuOpen ? 'open' : ''}`}>
                <Link href="/">Accueil</Link>
                <Link href="/actualities">Actualités</Link>
                <Link href="/polls">Sondages</Link>
                <Link href="/documents">Documents</Link>
                <Link href="/contact">Contact</Link>

                {status === "authenticated" ? (
                    <>
                        <Link href="/profil">Profil</Link>
                        <button className="button-red-off" onClick={() => signOut({ callbackUrl: '/' })}>
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
