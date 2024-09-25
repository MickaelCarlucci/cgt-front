"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fetchWithToken } from "../../../utils/fetchWithToken";
import { BsBoxArrowRight } from "react-icons/bs";
import "./page.css";

export default function Page() {
  const params = useParams();
  const { centerId } = params;
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [activityLink, setActivityLink] = useState("");
  const [activityUnlink, setActivityUnlink] = useState("");
  const [titleCenter, setTitleCenter] = useState("");
  const [error, setError] = useState("");

  const roles = session?.user?.roles?.split(", ") || []; // Vérifie l'état de session pour ne pas afficher d'erreur
  const hasAccess = ["Admin", "SuperAdmin"].some((role) =>
    roles.includes(role)
  );
  const userId = session?.user?.id;

  useEffect(() => {
    if (status === "authenticated" && userId) {
        const fetchData = async () => {
            try {
              const activitiesResponse = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}/activities`);
              const activitiesData = await activitiesResponse.json();
              setActivities(activitiesData);

                // Fetch de toutes les activités disponibles
                const allActivitiesResponse = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/activities`);
                const allActivitiesData = await allActivitiesResponse.json();
                setAllActivities(allActivitiesData);

                // Fetch du titre du centre
                const titleResponse = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}`);
                const titleData = await titleResponse.json();
                setTitleCenter(titleData.name);

            } catch (error) {
                console.error("Erreur lors de la récupération des données", error);
                setError("Impossible de récupérer les données");
            }
        };
        fetchData();
    }
}, [status, userId, centerId]);

const fetchActivitiesByCenter = async () => {
  try {
    const activitiesResponse = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}/activities`);
    const activitiesData = await activitiesResponse.json();
    setActivities(activitiesData);
  } catch (error) {
    console.error("Erreur lors de la récupération des activités", error);
    setError("Impossible de récupérer les activités du centre");
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const activityData = {
    centerId,
    activityId: activityLink, // Utilisez directement activityLink qui est l'ID
  };
  console.log(activityData);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/link`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activityData),
      }
    );
    if (response.ok) {
      setActivityLink(""); // Réinitialiser le champ de saisie
      setError("");
      await fetchActivitiesByCenter(); // Recharger les activités du centre
    } else {
      setError("Erreur lors de la mise à jour des activités");
    }
  } catch (error) {
    console.error("Erreur:", error);
    setError("Erreur lors du rattachement de l'activité");
  }
};


const handleUnlinkActivity = async (activityId) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}/unlink/${activityId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        }
      }
    );
    if (response.ok) {
      console.log("détachement réussi", activityId)
      setActivityUnlink("");
      setError("");
      await fetchActivitiesByCenter(); // Recharger les activités du centre
    } else {
      setError("Erreur lors de la mise à jour des activités");
    }
  } catch (error) {
    console.error("Erreur:", error);
    setError("Erreur lors du détachement de l'activité");
  }
};


  return (
    <>
      <div className="main-contain">
        <div className="activitiesCenter-contain">
          <h1>Activités de {titleCenter} </h1>
          <ul>
            {activities
              .filter((activity) => activity.id !== 47)
              .map((activity) => (
                <li key={activity.id}>
                  {" "}
                  {activity.name}{" "}
                  <span
                    type="button"
                    onClick={() => handleUnlinkActivity(activity.id)} // Passez seulement activity.id
                    style={{ cursor: "pointer" }}
                  >
                    <BsBoxArrowRight />
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <div className="management-activity-contain">
          <h2>Joindre une activité au centre</h2>
          <form>
            <select
              value={activityLink}
              onChange={(e) => setActivityLink(e.target.value)} // Met à jour activityLink directement avec l'ID
              required
            >
              <option value="" disabled>
                Selectionnez une activité
              </option>
              {allActivities
                .filter((activity) => activity.id !== 47)
                .map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
            </select>
            <button type="submit" onClick={handleSubmit}>
              Rattacher au centre
            </button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </>
  );
}
