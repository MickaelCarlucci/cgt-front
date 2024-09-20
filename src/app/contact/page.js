"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fetchWithToken } from "../utils/fetchWithToken";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [filteredElected, setFilteredElected] = useState([]);
  const [error, setError] = useState("");

  const roles = session?.user?.roles?.split(", ") || [];

  const hasAccess = ["Admin", "SuperAdmin", "Membre"].some((role) =>
    roles.includes(role)
  );

  useEffect(() => {
    const fetchElected = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected`
        );
        const data = await response.json();
        setFilteredElected(data); // Initialise les élus filtrés avec toutes les données
      } catch (error) {
        setError("Erreur lors de la récupération des utilisateurs");
      }
    };
    if (status === "authenticated") {
      fetchElected();
    }
  }, [status]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`
        );
        const data = await response.json();
        setCenters(data);
      } catch (error) {
        setError("Erreur lors de la récupération des centres.");
      }
    };

    if (status === "authenticated") {
      fetchCenters();
    }
  }, [status]);

  const listElectedByCenter = async (centerId) => {
    try {
      setSelectedCenter(centerId); // Met à jour l'état pour le centre sélectionné
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected/${centerId}`
      );
      const data = await response.json();
      setFilteredElected(data); // Mets à jour les élus filtrés
    } catch (error) {
      setError("Erreur lors de la récupération des utilisateurs.");
    }
  };

  const resetFilters = async () => {
    setSelectedCenter(null);
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected`
      );
      const data = await response.json();
      setFilteredElected(data);
    } catch (error) {
      setError("Erreur lors de la récupération des utilisateurs.");
    }
  };

  return (
    <>
      {hasAccess ? (
        <div>
          <h1>Liste des élus CGT</h1>
          <div>
            <button onClick={resetFilters}>Afficher tous vos élus</button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div>
            {/* Boucle sur les centres en excluant ceux avec l'id 14 et 15 */}
            {centers
              .filter((center) => center.id !== 14 && center.id !== 15)
              .map((center) => (
                <div
                  key={center.id}
                  value={center.id}
                  onClick={() => listElectedByCenter(center.id)}
                >
                  <Link href={"#"}>{center.name}</Link>
                </div>
              ))}
          </div>
          <div>
            {/* Boucle sur les élus filtrés */}
            {filteredElected.map((elected) => (
              <div key={elected.id}>
                <h3>
                  {elected.firstname} {elected.lastname}
                </h3>
                {elected.phone && (
                  <p>
                    Numéro de téléphone <span>{elected.phone}</span>
                  </p>
                )}
                <p>
                  Adresse mail: <span>{elected.mail}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>
          Vous devez vous inscrire pour avoir accès à la liste des élus, cliquez{" "}
          <Link href="/auth/signup">ici</Link>
        </p>
      )}
    </>
  );
}
