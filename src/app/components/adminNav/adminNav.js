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
        {roles.includes("Admin") || roles.includes("SuperAdmin") ? ( 
            <>
        <Link href="/admin">Gérer les utilisateurs</Link>
        <Link href="/admin/files">Ajouter un document</Link>
        <Link href="#">Message</Link>
        </>
    ) : null }

    {roles.includes("Elus") || roles.includes("Admin") || roles.includes("SuperAdmin") ? ( 
            <>
        <Link href="#">Tract</Link>
        </>
    ) : null }
      </nav>
    </div>
  )
}
