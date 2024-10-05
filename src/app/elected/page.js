"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchWithToken } from "../utils/fetchWithToken";
import Link from "next/link";
import SectionRP from "../components/sectionRP/sectionRP";
import SectionCSE from "../components/sectionCSE/sectionCSE";
import SectionCSSCT from "../components/sectionCSSCT/sectionCSSCT";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [appointment, setAppointment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleSection, setVisibleSection] = useState(null); // État pour suivre quelle section est visible
  const [formData, setFormData] = useState({
    subject: "",
    date: "",
    linkMeeting: ""
  });
  const [error, setError] = useState("");

  // Gestion des rôles : si la session est chargée et qu'il y a un utilisateur
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/elected/appointment/update`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData("");
        setError("");
        appointmentFetch();
        closeModal();
      } else {
        setError("Une erreur est survenue lors de la mise en place du nouveau rendez-vous");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Une erreur s'est produite pendant la mise en place du nouveau rendez-vous");
    }
  };

  // Si la session est encore en train de se charger
  if (status === "loading") {
    return <p>Chargement de la session...</p>;
  }

  // Si les rôles ne sont pas définis
  if (!roles.length) {
    return <p>Aucun rôle défini pour l&apos;utilisateur.</p>;
  }

  // Fonction pour basculer l'affichage des sections
  const toggleSection = (section) => {
    setVisibleSection((prevSection) => (prevSection === section ? null : section));
  };

  return (
    <>
      <div className="navbar-elected">
        {(roles.includes("DS") || roles.includes("CSE") || roles.includes("SuperAdmin") || roles.includes("Admin")) && (
          <Link href="#" onClick={() => toggleSection("CSE")}>CSE</Link>
        )}
        {(roles.includes("DS") || roles.includes("CSSCT") || roles.includes("SuperAdmin") || roles.includes("Admin")) && (
          <Link href="#" onClick={() => toggleSection("CSSCT")}>CSSCT</Link>
        )}
        {(roles.includes("DS") || roles.includes("RP") || roles.includes("SuperAdmin") || roles.includes("Admin")) && (
          <Link href="#" onClick={() => toggleSection("RP")}>RP</Link>
        )}
      </div>

      {(roles.includes("DS") || roles.includes("SuperAdmin") || roles.includes("Admin") || roles.includes("RP") || roles.includes("CSSCT") || roles.includes("CSE")) ? (
        <div className="content-elected">
          <h1>Prochain rendez-vous:</h1>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="appointment-div">
          <p>Sujet de la réunion: {appointment.subject}</p>
          <p>Date: {appointment.date}</p>
          <p>
            <Link target="_blank" rel="noopener noreferrer" href={`${appointment.linkMeeting}`}>
              Cliquez ici
            </Link> {" "}
            pour accéder à la réunion ou copiez le lien ci-dessous.
          </p>
          <p>{appointment.linkMeeting}</p>
          </div>
          {(roles.includes("Admin") || roles.includes("SuperAdmin")) && (
            <button className="button-appointment" onClick={openModal}>Modifier le rendez-vous</button>
          )}

          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h3>Modifier le rendez-vous</h3>
                <form className="modal-form-elected" onSubmit={handleSubmit}>
                  <div>
                    <label className="modal-label-elected" htmlFor="subject">Sujet :</label>
                    <input 
                    className="modal-input-elected"
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label-elected" htmlFor="date">Date :</label>
                    <input
                    className="modal-input-elected"
                      type="text"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label-elected" htmlFor="linkMeeting">Lien de la réunion :</label>
                    <input
                    className="modal-input-elected"
                      type="text"
                      id="linkMeeting"
                      name="linkMeeting"
                      value={formData.linkMeeting}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <button className="modal-button-elected" type="submit">Enregistrer les modifications</button>
                  <button className="modal-button-elected" type="button" onClick={closeModal}>
                    Annuler
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Affichage conditionnel basé sur l'état visibleSection */}
          {visibleSection === "RP" && <SectionRP />}
          {visibleSection === "CSE" && <SectionCSE />}
          {visibleSection === "CSSCT" && <SectionCSSCT />}
        </div>
      ) : (
        <p>
          Vous vous êtes perdu ? Revenez à l&apos;<Link href="/">accueil</Link>
        </p>
      )}
    </>
  );
}
