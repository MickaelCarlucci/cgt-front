"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchWithToken } from "../../utils/fetchWithToken";
import { TfiTrash } from "react-icons/tfi";
import Link from "next/link";
import Loader from "@/app/components/Loader/Loader";
import "./page.css";

export default function Page() {
  const { user, loading } = useSelector((state) => state.auth);
  const [centers, setCenters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [center, setCenter] = useState("");
  const [errorCenter, setErrorCenter] = useState("");
  const [errorActivity, setErrorActivity] = useState("");

  const roles = user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
    roles.includes(role)
  );
  const userId = user?.id;

  const centerFetch = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`
      );
      const data = await response.json();
      setCenters(data);
    } catch (errorCenter) {
      setErrorCenter("Erreur lors de la récupération des centres");
    }
  };

  const activitiesFetch = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activities`
      );
      const data = await response.json();
      setActivities(data);
    } catch (errorActivity) {
      setErrorActivity("Erreur lors de la récupération des activités");
    }
  };

  useEffect(() => {
    if (user && userId) {
      centerFetch();
      activitiesFetch();
    }
  }, [user, userId]);

  const handleAddCenter = async (e) => {
    e.preventDefault();

    if (!center.trim()) {
      setErrorCenter("Le nom du centre ne peut pas être vide.");
      return;
    }

    const centerData = { name: center };

    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/addCenter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(centerData),
        }
      );
      if (response.ok) {
        setCenter("");
        setErrorCenter("");
        centerFetch();
      } else {
        setErrorCenter("Erreur lors de la mise à jour des centres");
      }
    } catch (errorCenter) {
      console.error("Erreur:", errorCenter);
      setErrorCenter("Erreur lors de l'ajout du centre");
    }
  };

  const handleDeleteCenter = async (centerId) => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/${centerId}/deleteCenter`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setCenters(centers.filter((center) => center.id !== centerId));
      } else {
        setErrorCenter("Erreur lors de la suppression du centre");
      }
    } catch (errorCenter) {
      console.error("Erreur:", errorCenter);
      setErrorCenter("Erreur lors de la suppression du centre");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/${activityId}/deleteActivity`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setActivities(
          activities.filter((activity) => activity.id !== activityId)
        );
      } else {
        setErrorActivity("Erreur lors de la suppression de l'activité");
      }
    } catch (errorActivity) {
      console.error("Erreur:", errorActivity);
      setErrorActivity("Erreur lors de la suppression de l'activité");
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      {hasAccess ? (
        <div className="main-contain-center-admin">
          <h1>Gestion des centres et activités</h1>
          <div className="main-contain">
            <div className="left-contain">
              <div className="contain-centers">
                <h2>Liste des centres</h2>
                <ul>
                  {centers
                    .filter((center) => center.id !== 14 && center.id !== 15)
                    .map((center) => (
                      <li key={center.id}>
                        <Link href={`/admin/centers/${center.id}`}>
                          {center.name}{" "}
                        </Link>{" "}
                        <span
                          type="button"
                          onClick={() => handleDeleteCenter(center.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <TfiTrash />
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="contain-addCenter">
                <form onSubmit={handleAddCenter}>
                  <input
                    type="text"
                    placeholder="Nouveau Centre..."
                    value={center}
                    onChange={(e) => setCenter(e.target.value)}
                    required
                  />
                  <button type="submit">Ajouter un centre</button>
                  {errorCenter && <p style={{ color: "red" }}>{errorCenter}</p>}
                </form>
              </div>
            </div>
            <div className="right-contain">
              <div className="contain-activities">
                <h2>Liste des activités</h2>
                <ul>
                  {activities
                    .filter((activity) => activity.id !== 47)
                    .map((activity) => (
                      <li key={activity.id}>
                        {activity.name}{" "}
                        <span
                          type="button"
                          onClick={() => handleDeleteActivity(activity.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <TfiTrash />
                        </span>
                      </li>
                    ))}
                </ul>
                {errorActivity && (
                  <p style={{ color: "red" }}>{errorActivity}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="connected">
          Vous ne devriez pas être ici. Merci de revenir à{" "}
          <Link href={"/"}>L&apos;accueil</Link>
        </p>
      )}
    </>
  );
}
