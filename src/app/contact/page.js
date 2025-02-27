"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { fetchWithToken } from "../utils/fetchWithToken";
import Loader from "../components/Loader/Loader";
import "./page.css";

export default function Page() {
  const { user, loading } = useSelector((state) => state.auth);
  const [centers, setCenters] = useState([]);
  const [filteredElected, setFilteredElected] = useState([]);
  const [rolesData, setRolesData] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");

  const roles = user?.roles?.split(", ") || [];

  const hasAccess = [
    "Admin",
    "SuperAdmin",
    "Membre",
    "Moderateur",
    "DS",
    "CSE",
    "CSSCT",
    "RP",
  ].some((role) => roles.includes(role));

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
    if (user) {
      fetchData(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected`,
        setFilteredElected,
        "Erreur lors de la récupération des utilisateurs"
      );
      fetchData(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/roles`,
        setRolesData,
        "Erreur lors de la récupération des rôles"
      );
      fetchData(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`,
        setCenters,
        "Erreur lors de la récupération des centres"
      );
    }
  }, [user]);

  const listElectedByCenter = async (centerId) => {
    setSelectedCenter(centerId);
    fetchData(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected/${centerId}`,
      setFilteredElected,
      "Erreur lors de la récupération des utilisateurs par centre."
    );
  };

  const listElectedByRole = async (roleId) => {
    setSelectedRole(roleId);
    fetchData(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/electedRole/${roleId}`,
      setFilteredElected,
      "Erreur lors de la récupération des utilisateurs par rôle."
    );
  };

  const resetFilters = async () => {
    setSelectedCenter(null);
    setSelectedRole(null);
    fetchData(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/elected`,
      setFilteredElected,
      "Erreur lors de la récupération des utilisateurs."
    );
  };

  if (loading) return <Loader />;

  return (
    <>
      {hasAccess ? (
        <div className="main-contain-contact">
          <h1>Liste des élus CGT</h1>
          <div>
            <button className="contact-button" onClick={resetFilters}>
              Tous vos élu(e)s
            </button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <h4>Filtres:</h4>

          <div className="list-center">
            {centers
              .filter((center) => center.id !== 14 && center.id !== 15)
              .map((center) => (
                <div
                  key={center.id}
                  value={center.id}
                  onClick={() => listElectedByCenter(center.id)}
                >
                  <p href={"#"}>{center.name}</p>
                </div>
              ))}

            {rolesData
              .filter((role) => [4, 5, 6, 7].includes(role.id))
              .map((role) => (
                <div
                  key={role.id}
                  value={role.id}
                  onClick={() => listElectedByRole(role.id)}
                >
                  <p href={"#"}>{role.name}</p>
                </div>
              ))}
          </div>

          <div className="contact-information">
            {filteredElected.map((elected) => (
              <div className="information-elected" key={elected.id}>
                <h3>
                  {elected.lastname} {elected.firstname}
                </h3>
                {elected.phone && (
                  <p>
                    Numéro de téléphone: <span>{elected.phone}</span>
                  </p>
                )}
                <p>
                  Adresse mail: <span>{elected.mail}</span>
                </p>
                <p>
                  Mandat(s): <span>{elected.roles}</span>
                </p>
                <p>
                  Centre: <span>{elected.center_name}</span>
                </p>
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
