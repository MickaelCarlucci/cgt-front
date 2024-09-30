"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import imgCGT from "../../../../public/assets/logoCGT.png";
import { FaBars, FaTimes, FaPowerOff } from 'react-icons/fa';
import './header.css';

export default function Header() {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

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
                            <FaPowerOff size={18} />
                        </button>
                    </>
                ) : (
                    <Link href="/auth">Connectez-vous</Link>
                )}
            </nav>
        </div>
    );
}
