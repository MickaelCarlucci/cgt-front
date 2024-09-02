"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [searchBar, setSearchBar] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([])
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const roles = session?.user?.roles?.split(", ") || []; //vérifie l'état de session pour ne pas afficher d'erreur

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/users`);
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        setError("Erreur lors de la récupération des utilisateurs")
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchBar) {
      filtered = filtered.filter(user => 
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchBar.toLowerCase())
      );
    }

    setFilteredUsers(filtered); // Mise à jour de l'état avec les utilisateurs filtrés
  }, [searchBar, users]);

  return (
    <>
    {roles.includes("Admin") || roles.includes("SuperAdmin") ? (
      <> 
      <h1>Liste des utilisateurs</h1>
      <div>
        <input type="text"
                placeholder="Ecrivez votre recherche..."
                value={searchBar}
                onChange={e => setSearchBar(e.target.value)} />
      </div>
        <ul className="user-grid">
      {filteredUsers.map((user) => (
        <li key={user.id}>
          <Link href={`/admin/${user.id}`}>{user.firstname} {user.lastname}</Link>
        </li>
    ))}
    </ul>
    </>
    ): (
      <p>Vous ne devriez pas être ici ! Revenez à la page d&apos;<Link href="/">accueil</Link></p>
    )}
    </>
  )
}
