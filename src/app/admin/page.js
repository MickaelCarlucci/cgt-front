"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import Loader from "../components/Loader/Loader";
import "./page.css";

export default function Page() {
  const { user, loading } = useSelector((state) => state.auth);
  const [searchBar, setSearchBar] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  const roles = user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin"].some((role) =>
    roles.includes(role)
  );

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

    setFilteredUsers(filtered);
  }, [searchBar, users]);

  const fetchUsersWithoutRole = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search/users-without-role`
      );
      const data = await response.json();
      setFilteredUsers(data);
      setUsers(data);
    } catch {
      setError("Erreur lors de la récupération des utilisateurs");
    }
  };

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

  const resetFilters = async () => {
    setSelectedCenter(null);
    setActivities([]);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search/users`
      );
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      setError("Erreur lors de la récupération des utilisateurs.");
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      {hasAccess ? (
        <>
          <h1 className="h1-admin-page">Liste des utilisateurs</h1>

          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="search-button-contact">
            <button onClick={resetFilters}>
              Afficher tous les utilisateurs
            </button>
            <button onClick={fetchUsersWithoutRole}>
              Utilisateurs sans rôle
            </button>
          </div>
          <div className="centers-list">
            {centers.map((center) => (
              <div
                className="center-filtered"
                key={center.id}
                value={center.id}
                onClick={() => listUsersByCenter(center.id)}
              >
                <p>{center.name}</p>
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
                  <p>{activity.name}</p>
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
        <p className="connected">
          Vous ne devriez pas être ici ! Revenez à la page d&apos;
          <Link href="/">accueil</Link>
        </p>
      )}
    </>
  );
}
