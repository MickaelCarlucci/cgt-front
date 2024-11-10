"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { TfiTrash } from "react-icons/tfi";
import { fetchWithToken } from "../../utils/fetchWithToken";
import Loader from "@/app/components/Loader/Loader";
import "./page.css";

export default function Page() {
  const { user, loading } = useSelector((state) => state.auth);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([""]); // On initialise avec une option vide
  const [polls, setPolls] = useState([]); // Tableau vide pour stocker les sondages
  const [errorMessage, setErrorMessage] = useState("");
  const roles = user?.roles?.split(", ") || [];
  const userId = user?.id;

  // Fonction pour ajouter une nouvelle option
  const addOption = () => {
    setOptions([...options, ""]); // Ajoute une nouvelle option vide
  };

  const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
    roles.includes(role)
  );

  // useEffect pour récupérer les sondages
  useEffect(() => {
    async function fetchPolls() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/poll/polls`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des sondages");
        const data = await response.json();
        setPolls(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sondages:", error);
        setErrorMessage("Erreur lors de la récupération des sondages.");
      }
    }
    if (user && userId) {
      fetchPolls();
    }
  }, [user, userId]);

  // Fonction pour supprimer une option
  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index); // Retirer l'option d'index donné
    setOptions(newOptions);
  };

  // Fonction pour mettre à jour une option
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche la soumission par défaut

    // Envoie les données à l'API route
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_API_URL}/api/poll/newPoll`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          options: options.filter((option) => option.trim() !== ""), // Ne garde que les options non vides
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Sondage créé:", data);

      // Réinitialisation du formulaire après succès
      setQuestion(""); // Remettre la question à zéro
      setOptions([""]); // Remettre une seule option vide

      // Mettre à jour la liste des sondages après création
      setPolls([...polls, data]);
    } else {
      console.error("Erreur lors de la création du sondage");
    }
  };

  // Fonction pour supprimer un sondage
  const handleDelete = async (pollId) => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poll/delete/${pollId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Mettre à jour la liste des sondages après suppression
        setPolls(polls.filter((poll) => poll.id !== pollId));
      } else {
        console.error("Erreur lors de la suppression du sondage");
      }
    } catch (error) {
      setErrorMessage(
        "Une erreur est survenue lors de la suppression. Veuillez réessayer."
      );
      console.error("Erreur lors de la suppression:", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      {hasAccess ? (
        <div className="main-part-contain">
          <div className="part-left">
            <h2>Créer un sondage</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="question">Question:</label>
                <br />
                <input
                  type="text"
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
                <br />
                <br />
              </div>

              <div id="optionsContainer">
                {options.map((option, index) => (
                  <div className="option-parameter" key={index}>
                    <label htmlFor={`option${index + 1}`}>
                      Option {index + 1}:
                    </label>
                    <br />
                    <input
                      type="text"
                      id={`option${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      required
                    />
                    <button
                      className="button-left-part delete-button-poll"
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={options.length === 1}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}

                <button
                  className="button-left-part"
                  type="button"
                  onClick={addOption}
                >
                  Ajouter une option
                </button>
              </div>

              <button className="button-left-part create-poll" type="submit">
                Créer le sondage
              </button>
            </form>
          </div>

          <div className="part-right">
            <h2>Liste des sondages</h2>
            {errorMessage && <p className="error">{errorMessage}</p>}
            <ul>
              {polls.map((poll) => (
                <li key={poll.id}>
                  {poll.question}
                  <span type="button" onClick={() => handleDelete(poll.id)}>
                    <TfiTrash />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="connected">
          Vous ne devriez pas être ici ! Revenez à la page d&apos;
          <Link href="/">accueil</Link>
        </p>
      )}
    </>
  );
}
