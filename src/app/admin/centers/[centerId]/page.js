"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { fetchWithToken } from "../../../utils/fetchWithToken";
import { BsBoxArrowRight } from "react-icons/bs";
import Loader from "@/app/components/Loader/Loader";
import "./page.css";

export default function Page() {
  const params = useParams();
  const { centerId } = params;
  const { user, loading } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [activity, setActivity] = useState("");
  const [activityLink, setActivityLink] = useState("");
  const [activityUnlink, setActivityUnlink] = useState("");
  const [titleCenter, setTitleCenter] = useState("");
  const [error, setError] = useState("");

  const roles = user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
    roles.includes(role)
  );
  const userId = user?.id;

  useEffect(() => {
    if (user && userId) {
      const fetchData = async () => {
        try {
          const activitiesResponse = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}/activities`
          );
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData);

          const allActivitiesResponse = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/activities`
          );
          const allActivitiesData = await allActivitiesResponse.json();
          setAllActivities(allActivitiesData);

          const titleResponse = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}`
          );
          const titleData = await titleResponse.json();
          setTitleCenter(titleData.name);
        } catch (error) {
          console.error("Erreur lors de la récupération des données", error);
          setError("Impossible de récupérer les données");
        }
      };
      fetchData();
    }
  }, [user, userId, centerId]);

  const fetchActivitiesByCenter = async () => {
    try {
      const activitiesResponse = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}/activities`
      );
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
      activityId: activityLink,
    };

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
        setActivityLink("");
        setError("");
        await fetchActivitiesByCenter();
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
          },
        }
      );
      if (response.ok) {
        setActivityUnlink("");
        setError("");
        await fetchActivitiesByCenter();
      } else {
        setError("Erreur lors de la mise à jour des activités");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors du détachement de l'activité");
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();

    if (!activity.trim()) {
      setError("Le nom de l'activité ne peut pas être vide.");
      return;
    }

    const activityData = {
      name: activity,
      centerId,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/addActivity`,
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
        setActivity("");
        setError("");
        fetchActivitiesByCenter();
      } else {
        setError("Erreur lors de la mise à jour des activités");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors de l'ajout de l'activité");
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      {hasAccess ? (
        <div className="main-contain-center">
          <div className="title-activity">
            <h1>Activités de {titleCenter} </h1>
          </div>

          <div className="activitiesCenter-contain">
            <ul>
              {activities
                .filter((activity) => activity.id !== 47)
                .map((activity) => (
                  <li key={activity.id}>
                    {" "}
                    {activity.name}{" "}
                    <span
                      type="button"
                      onClick={() => handleUnlinkActivity(activity.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <BsBoxArrowRight />
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          <div className="contain-addActivity">
            <form onSubmit={handleAddActivity}>
              <input
                type="text"
                placeholder="Nouvelle activité..."
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                required
              />
              <button type="submit">Ajouter une activité</button>
            </form>
          </div>

          <div className="management-activity-contain">
            <h2>Joindre une activité déjà existante au centre</h2>
            <form>
              <select
                value={activityLink}
                onChange={(e) => setActivityLink(e.target.value)}
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
      ) : (
        <p className="connected">
          Vous ne devriez pas être ici, merci de revenir à{" "}
          <Link href={"/"}> L&apos;accueil</Link>
        </p>
      )}
    </>
  );
}
