"use client"
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Modal from "../../components/modal/modal";
import "./page.css";

export default function Page() {
  const params = useParams();
  const { id } = params;
  const {data: session, status} = useSession();
  const [user, setUser] = useState(null); // Initialiser avec null
  const [error, setError] = useState("");
  const router = useRouter();

  const roles = session?.user?.roles?.split(", ") || []; // Vérifie l'état de session pour ne pas afficher d'erreur

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/findUserProfile/${id}`);
        const userData = await userResponse.json();
        setUser(userData);

      } catch (error) {
        setError("Erreur lors de la récupération de l'utilisateur");
      }
    };
    fetchUser();
  }, [id]);

  const openModal = (field) => {
    setModalField(field);
    setInputValue(""); // Pré-remplir l'input avec la valeur actuelle
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalField("");
    setError(""); // Réinitialiser l'erreur lors de la fermeture de la modal
  };

  const handleDelete = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/delete`, 
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
        )

        if (response.ok) {
            router.push("/admin")
        }
    }

  if (!user) return <p>Chargement...</p>; // Afficher un message de chargement si l'utilisateur n'est pas encore défini

  return (
    <>
      {roles.includes("Admin") || roles.includes("SuperAdmin") ? (
        <div>
          <h1>Vous êtes sur le profil de <span>{user.firstname} {user.lastname}</span></h1>
          <p>Son pseudo est <span>{user.pseudo}</span></p>
          <p>Son adresse mail est <span>{user.mail}</span></p>
          <p><Link href="#" onClick={() => openModal("mail")}>Voulez-vous supprimer son compte ?</Link></p>
        </div>
      ) : (
        <p>
          Vous ne devriez pas être ici ! Revenez à la page d&apos;
          <Link href="/">accueil</Link>
        </p>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Confirmer la suppression">
        <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
                  <label>Saississez votre adresse mail pour confirmer la suppression:</label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)} />
        <button onClick={closeModal}>Annuler</button>
        <button onClick={() => {handleDelete}}>Supprimer</button>
      </Modal>
    </>
  );
}