"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchWithToken } from "../utils/fetchWithToken";
import Link from "next/link";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [appointment, setAppointment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour la modal
  const [formData, setFormData] = useState({
    subject: "",
    date: "",
    linkMeeting: ""
  });
  const [error, setError] = useState("")

  const roles = session?.user?.roles?.split(", ") || [];
  const userId = session?.user?.id;

  const appointmentFetch = async () => {
    try {
      const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/elected/appointment`);
      const data = await response.json();
      setAppointment(data);
      setFormData({
        subject: data.subject,
        date: data.date,
        linkMeeting: data.linkMeeting
      });
    } catch (error) {
      setError("Erreur lors de la récupération du rendez-vous.");
    }
  };

  useEffect(() => {
    if (status === "authenticated" && userId) {
      appointmentFetch();
    }
  }, [status, userId]);

  // Gérer l'ouverture et la fermeture de la modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/elected/appointment/update`,
            {
                method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),        
            }
        );
        if (response.ok) {
            setFormData("");
            setError("");
            appointmentFetch();
            closeModal();
        } else {
            setError("Une erreur est survenu lors de la mise en place du nouveau rendez-vous")
        }
    } catch(error) {
        console.error("Erreur:", error)
        setError("Une erreur s'est produite pendant la mise en place du nouveau rendez-vous")
    }
    // Tu pourrais envoyer les données modifiées au backend ici via fetch ou axios
  };

  return (
    <>
      {roles.includes("Elus") || roles.includes("SuperAdmin") ? (
        <div>
          <h1>Prochain rendez-vous:</h1>
          {error && <p style={{color: "red"}}>{error} </p>}
          <p>Sujet de la réunion: {appointment.subject}</p>
          <p>Date: {appointment.date}</p>
          <p>
            <Link target="_blank" rel="noopener noreferrer" href={`${appointment.linkMeeting}`}>
              Cliquez ici
            </Link>
            pour accéder à la réunion ou copiez le lien ci-dessous.
          </p>
          <p>{appointment.linkMeeting}</p>

        {roles.includes("Admin") || roles.includes("SuperAdmin") && (
          <button onClick={openModal}>Modifier le rendez-vous</button>
        )}

          {/* Modal pour modifier le rendez-vous */}
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h3>Modifier le rendez-vous</h3>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="subject">Sujet :</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="date">Date :</label>
                    <input
                      type="text"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="linkMeeting">Lien de la réunion :</label>
                    <input
                      type="text"
                      id="linkMeeting"
                      name="linkMeeting"
                      value={formData.linkMeeting}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {error && <p style={{color: "red"}}>{error} </p>}
                  <button type="submit">Enregistrer les modifications</button>
                  <button type="button" onClick={closeModal}>
                    Annuler
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>
          Vous vous êtes perdu ? Revenez à l&apos;<Link href="/">accueil</Link>
        </p>
      )}

    </>
  );
}
