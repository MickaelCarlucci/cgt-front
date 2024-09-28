"use client"
import "./adminNav.css";
import Link from "next/link";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { FaBars, FaTimes  } from 'react-icons/fa';



export default function AdminNav() {

    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const roles = session?.user?.roles?.split(", ") || []; //vérifie l'état de session pour ne pas afficher d'erreur
    

    if (status !== "authenticated") {
        return null; // Ou retournez un message de chargement ou autre pour les utilisateurs non authentifiés
    }
  return (
    <div className="navAdmin">
        <button className="menu-toggle-admin" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

      <nav className={`navbar-admin ${menuOpen ? 'open' : ''}`}>
        {roles.includes("Admin") || roles.includes("SuperAdmin") || roles.includes("Moderateur") ? ( 
            <>
        <Link href="/admin">Gérer les utilisateurs</Link>
        <Link href="/admin/files">Ajouter/supprimer un document</Link>
        <Link href="/admin/poll">Ajouter/supprimer un sondage</Link>
        <Link href="/admin/centers">Gérer les centres et activités</Link>
        <Link href="/admin/message">Message</Link>
        </>
    ) : null }

    {roles.includes("DS") || roles.includes("Admin") || roles.includes("SuperAdmin") || roles.includes("Moderateur") || roles.includes("CSE") || roles.includes("CSSCT") || roles.includes("RP") ? ( 
            <>
        <Link href="#">Tract</Link>
        <Link href="/elected">Elu(e)s et Mandaté(e)s</Link>
        </>
    ) : null }
      </nav>
    </div>
  )
}
