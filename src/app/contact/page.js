"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fetchWithToken } from "../utils/fetchWithToken";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [centers, setCenters] = useState([]);
  const [filteredElected, setFilteredElected] = useState([]);
  const [rolesData, setRolesData] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");

  const roles = session?.user?.roles?.split(", ") || [];

  const hasAccess = ["Admin", "SuperAdmin", "Membre", "Moderateur", "DS", "CSE", "CSSCT", "RP"].some((role) =>
    roles.includes(role)
  );

  // Fonction générique pour fetch les données
  const fetchData = async (url, setter, errorMsg) => {
    try {
      const response = await fetchWithToken(url);
      const data = await response.json();
      setter(data);
    } catch (error) {
      setError(errorMsg);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected`, setFilteredElected, "Erreur lors de la récupération des utilisateurs");
      fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/roles`, setRolesData, "Erreur lors de la récupération des rôles");
      fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`, setCenters, "Erreur lors de la récupération des centres");
    }
  }, [status]);

  const listElectedByCenter = async (centerId) => {
    setSelectedCenter(centerId);
    fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected/${centerId}`, setFilteredElected, "Erreur lors de la récupération des utilisateurs par centre.");
  };

  const listElectedByRole = async (roleId) => {
    setSelectedRole(roleId);
    fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/electedRole/${roleId}`, setFilteredElected, "Erreur lors de la récupération des utilisateurs par rôle.");
  };

  const resetFilters = async () => {
    setSelectedCenter(null);
    setSelectedRole(null);
    fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected`, setFilteredElected, "Erreur lors de la récupération des utilisateurs.");
  };

  return (
    <>
      {hasAccess ? (
        <div className="main-contain-contact">
          <h1>Liste des élus CGT</h1>
          <div>
            <button className="contact-button" onClick={resetFilters}>Tous vos élu(e)s</button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          
            <h4>Filtres:</h4>
          {/* Filtres par centres et rôles */}
          <div className="list-center" >
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
            
            {/* Boucle sur les rôles avec l'ID 4, 5, 6, ou 7 */}
            {rolesData
              .filter((role) => [4, 5, 6, 7].includes(role.id))
              .map((role) => (
                <div key={role.id} value={role.id} onClick={() => listElectedByRole(role.id)}>
                  <Link href={"#"}>{role.name}</Link>
                </div>
              ))}
          </div>
          
          {/* Liste des élus filtrés */}
          <div className="contact-information">
            {filteredElected.map((elected) => (
              <div className="information-elected" key={elected.id}>
                <h3>{elected.lastname} {elected.firstname}</h3>
                {elected.phone && (
                  <p>Numéro de téléphone: <span>{elected.phone}</span></p>
                )}
                <p>Adresse mail: <span>{elected.mail}</span></p>
                <p>Mandat(s): <span>{elected.roles}</span></p>
                <p>Centre: <span>{elected.center_name}</span></p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="connected">
          Vous devez vous inscrire pour avoir accès à la liste des élus, cliquez{" "}
          <Link href="/auth/signup">ici</Link>
        </p>
      )}
    </>
  );
}
