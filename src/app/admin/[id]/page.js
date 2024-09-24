"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Modal from "../../components/modal/modal";
import { fetchWithToken } from "../../utils/fetchWithToken";
import "./page.css";

export default function Page() {
  const params = useParams();
  const { id } = params;
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null); // Initialiser avec null
  const [roleList, setRoleList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [error, setError] = useState("");
  const router = useRouter();

  const roles = session?.user?.roles?.split(", ") || []; // Vérifie l'état de session pour ne pas afficher d'erreur
  const hasAccess = ["Admin", "SuperAdmin"].some((role) =>
    roles.includes(role)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/findUserProfile/${id}`
        );
        const userData = await userResponse.json();
        setUser(userData);

        const userRoles = userData.roles.split(",").map((role) => role.trim()); // Découpe la chaîne en tableau et enlève les espaces
        setSelectedRoles(userRoles);
      } catch (error) {
        setError("Erreur lors de la récupération de l'utilisateur");
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/roles`
        );
        const data = await response.json();
        setRoleList(data);
      } catch (error) {
        setError("Erreur lors de la récupération des rôles", error);
      }
    };

    fetchRoles();
  }, []);

  const openModal = (field) => {
    setModalField(field);
    setInputValue("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalField("");
    setError("");
  };

  const handleDelete = async () => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mail: inputValue,
          }),
        }
      );

      if (response.ok) {
        router.push("/admin");
      } else {
        setError("Erreur lors de la suppression de l'utilisateur");
      }
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  const updateRoleForUser = async (roleId, action) => {
    try {
      if (action === "add") {
        // Requête POST pour ajouter un rôle
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/role/${id}/link`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ roleId }),
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de l'ajout du rôle");
        }
      } else if (action === "remove") {
        // Requête DELETE pour supprimer un rôle
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/role/${id}/unlink`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ roleId }),
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du rôle");
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRoleChange = (roleId, roleName) => {
    if (selectedRoles.includes(roleName)) {
      // Supprimer le rôle si déjà sélectionné
      setSelectedRoles(selectedRoles.filter((role) => role !== roleName));
      updateRoleForUser(roleId, "remove"); // Envoyer l'ID du rôle à l'API pour le supprimer
    } else {
      // Ajouter le rôle s'il n'est pas sélectionné
      setSelectedRoles([...selectedRoles, roleName]);
      updateRoleForUser(roleId, "add"); // Envoyer l'ID du rôle à l'API pour l'ajouter
    }
  };

  if (status === "loading" || !user) return <p>Chargement...</p>; // Afficher un message de chargement si l'utilisateur n'est pas encore défini

  return (
    <>
      {hasAccess ? (
        <>
          <h1>
            Vous êtes sur le profil de{" "}
            <span>
              {user.firstname} {user.lastname}
            </span>
          </h1>
          <div className="container-management">
            <div className="user-information">
              <p>
                Son pseudo est <span>{user.pseudo}</span>
              </p>
              <p>
                Son nom et prénoms:{" "}
                <span>
                  {user.lastname} {user.firstname}
                </span>
              </p>
              <p>
                Son adresse mail est <span>{user.mail}</span>
              </p>
              <p>
                connecté pour la dernière fois le :{" "}
                <span>
                  {new Date(user.last_activity).toLocaleDateString("fr-FR", {
                    weekday: "long", 
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" "}à{" "}
                  {new Date(user.last_activity).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
              <p>
                <Link href="#" onClick={() => openModal("mail")}>
                  Voulez-vous supprimer son compte ?
                </Link>
              </p>
            </div>
            <div className="role">
              <form>
                {roleList.map((role) => (
                  <div key={role.id}>
                    <input
                      type="checkbox"
                      id={role.id}
                      value={role.id}
                      checked={selectedRoles.includes(role.name)}
                      onChange={(e) => handleRoleChange(role.id, role.name)}
                    />
                    <label htmlFor={role.id}>{role.name}</label>
                  </div>
                ))}
              </form>
            </div>
          </div>
        </>
      ) : (
        <p>
          Vous ne devriez pas être ici ! Revenez à la page d&apos;
          <Link href="/">accueil</Link>
        </p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Confirmer la suppression"
      >
        <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <label>
          Saisissez votre adresse mail pour confirmer la suppression :
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={closeModal}>Annuler</button>
        <button onClick={handleDelete}>Supprimer</button>
      </Modal>
    </>
  );
}
