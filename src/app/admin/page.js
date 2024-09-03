"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [searchBar, setSearchBar] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  const roles = session?.user?.roles?.split(", ") || []; //vérifie l'état de session pour ne pas afficher d'erreur

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/search/users`
        );
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        setError("Erreur lors de la récupération des utilisateurs");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`
        );
        const data = await response.json();
        setCenters(data);
      } catch (error) {
        setError("Erreur lors de la récupération des centres.");
      }
    };

    fetchCenters();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchBar) {
      filtered = filtered.filter((user) =>
        `${user.firstname} ${user.lastname}`
          .toLowerCase()
          .includes(searchBar.toLowerCase())
      );
    }

    setFilteredUsers(filtered); // Mise à jour de l'état avec les utilisateurs filtrés
  }, [searchBar, users]);

  const listUsersByCenter = async (centerId) => {
    try {
      setSelectedCenter(centerId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search/users/${centerId}`
      );
      const data = await response.json();
      setUsers(data);

      const activitiesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}/activities`
      );
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData);
    } catch (error) {
      setError("Erreur lors de la récupération des utilisateurs.");
    }
  };

  const listUsersByActivity = async (centerId, activityId) => {
    try {
      const responseActivity = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search/users/${centerId}/${activityId}`
      );
      const data = await responseActivity.json();
      setUsers(data); 
    } catch (error) {
      setError("Erreur lors de la récupération des utilisateurs.");
    }
  };

  return (
    <>
      {roles.includes("Admin") || roles.includes("SuperAdmin") ? (
        <>
          <h1>Liste des utilisateurs</h1>
          <div className="centers-list">
            {centers.map((center) => (
              <div
                className="center-filtered"
                key={center.id}
                value={center.id}
                onClick={() => listUsersByCenter(center.id)}
              >
                <Link href={"#"}>{center.name}</Link>
              </div>
            ))}
          </div>

          {selectedCenter && (
            <div className="activities-list">
              {activities.map((activity) => (
                <div
                  className="activity-filtered"
                  key={activity.id}
                  value={activity.id}
                  onClick={() =>
                    listUsersByActivity(selectedCenter, activity.id)
                  }
                >
                  <Link href={"#"}>{activity.name}</Link>
                </div>
              ))}
            </div>
          )}
          <div>
            <input
              type="text"
              placeholder="Ecrivez votre recherche..."
              value={searchBar}
              onChange={(e) => setSearchBar(e.target.value)}
            />
          </div>
          <ul className="user-grid">
            {filteredUsers.map((user) => (
              <li key={user.id}>
                <Link href={`/admin/${user.id}`}>
                  {user.firstname} {user.lastname}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          Vous ne devriez pas être ici ! Revenez à la page d&apos;
          <Link href="/">accueil</Link>
        </p>
      )}
    </>
  );
}
