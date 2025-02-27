"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../utils/authSlice";
import Link from "next/link";
import Image from "next/image";
import imgCGT from "../../../../public/assets/logoCGT.png";
import { FaBars, FaTimes, FaPowerOff } from "react-icons/fa";
import "./header.css";

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

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

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
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
        <div className="theme_switcher">
          <label id="switch" className="switch">
            <input
              className="dark-mode-toggle"
              type="checkbox"
              onChange={toggleDarkMode}
              checked={darkMode}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <Link href="/" onClick={handleLinkClick}>
          Accueil
        </Link>
        <Link href="/actualities" onClick={handleLinkClick}>
          Actualités
        </Link>
        <Link href="/polls" onClick={handleLinkClick}>
          Sondages
        </Link>
        <Link href="/documents" onClick={handleLinkClick}>
          Documents
        </Link>
        <Link href="/calculator" onClick={handleLinkClick}>
          Calculateur
        </Link>
        <Link href="/contact" onClick={handleLinkClick}>
          Contact
        </Link>

        {user ? (
          <>
            <Link href="/profil" onClick={handleLinkClick}>
              Profil
            </Link>
            <button className="button-red-off" onClick={handleLogout}>
              <FaPowerOff size={18} />{" "}
              <span className="disconnect-text">Déconnexion</span>
            </button>
          </>
        ) : (
          <Link href="/auth">Connexion</Link>
        )}
      </nav>
    </div>
  );
}
