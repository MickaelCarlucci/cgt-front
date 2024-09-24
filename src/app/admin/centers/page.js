"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchWithToken } from "../../utils/fetchWithToken";
import { TfiTrash } from "react-icons/tfi";
import Link from "next/link";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [centers, setCenters] = useState([]);
  const [center, setCenter] = useState("");
  const [error, setError] = useState("");

  const roles = session?.user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
    roles.includes(role)
  );
  const userId = session?.user?.id;

  const centerFetch = async () => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`
      );
      const data = await response.json();
      setCenters(data);
    } catch (error) {
      setError("Erreur lors de la récupération des centres");
    }
  };

  useEffect(() => {
    if (status === "authenticated" && userId) {
      centerFetch();
    }
  }, [status, userId]);

  const handleAddCenter = async (e) => {
    e.preventDefault();
    
    if (!center.trim()) {
      setError("Le nom du centre ne peut pas être vide.");
      return;
    }

    const centerData = { name: center };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/addCenter`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(centerData),
        }
      );
      if (response.ok) {
        setCenter("");  // Réinitialiser le champ de saisie
        setError("");
        centerFetch();  // Recharger les centres
      } else {
        setError("Erreur lors de la mise à jour des centres");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors de l'ajout du centre");
    }
  };

  const handleDeleteCenter = async (centerId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/${centerId}/deleteCenter`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (response.ok) {
        setCenters(centers.filter((center) => center.id !== centerId));
      } else {
        setError("Erreur lors de la suppression du centre");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors de la suppression du centre");
    }
  };

  return (
    <>
      <div className="main-contain">
        <div className="contain-centers">
          <h1>Liste des centres</h1>
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
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </div>
      </div>
    </>
  );
}
