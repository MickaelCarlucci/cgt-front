"use client";
import "./adminNav.css";
import Link from "next/link";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FaBars, FaTimes } from "react-icons/fa";

export default function AdminNav() {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const roles = user?.roles?.split(", ") || []; // vérifie l'état de session pour ne pas afficher d'erreur

  if (!user) {
    return null; // Ne rien retourner pour les utilisateurs non authentifiés
  }

  // Vérifier les droits
  const hasAccess =
    roles.includes("Admin") ||
    roles.includes("SuperAdmin") ||
    roles.includes("Moderateur") ||
    roles.includes("DS") ||
    roles.includes("CSE") ||
    roles.includes("CSSCT") ||
    roles.includes("RP");

  // Fonction pour fermer le menu après clic sur un lien
  const handleLinkClick = () => {
    setMenuOpen(false); // Fermer le menu après clic
  };

  return (
    <div className={`navAdmin ${!hasAccess ? "hidden" : ""}`}>
      {" "}
      {/* Ajouter la classe 'hidden' si pas d'accès */}
      <button
        className="menu-toggle-admin"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
      <nav className={`navbar-admin ${menuOpen ? "open" : ""}`}>
        {roles.includes("Admin") ||
        roles.includes("SuperAdmin") ||
        roles.includes("Moderateur") ? (
          <>
            <Link href="/admin" onClick={handleLinkClick}>
              Gérer les utilisateurs
            </Link>
            <Link href="/admin/files" onClick={handleLinkClick}>
              Ajouter/supprimer un document
            </Link>
            <Link href="/admin/poll" onClick={handleLinkClick}>
              Ajouter/supprimer un sondage
            </Link>
            <Link href="/admin/centers" onClick={handleLinkClick}>
              Gérer les centres et activités
            </Link>
            <Link href="/admin/message" onClick={handleLinkClick}>
              Message
            </Link>
          </>
        ) : null}

        {roles.includes("DS") ||
        roles.includes("Admin") ||
        roles.includes("SuperAdmin") ||
        roles.includes("Moderateur") ||
        roles.includes("CSE") ||
        roles.includes("CSSCT") ||
        roles.includes("RP") ? (
          <>
            <Link href="/elected" onClick={handleLinkClick}>
              Elu(e)s et Mandaté(e)s
            </Link>
          </>
        ) : null}
      </nav>
    </div>
  );
}
