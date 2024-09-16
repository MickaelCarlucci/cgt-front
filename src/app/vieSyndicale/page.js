"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PollDetails from "../components/optionPoll/page";
import PollResults from "../components/resultPoll/page";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();

  const roles = session?.user?.roles?.split(", ") || [];
  const userId = session?.user?.id;

  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null); // Initialisé à null
  const [voteStatuses, setVoteStatuses] = useState({});
  const [news, setNews] = useState([]);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Vérification des rôles
  const hasAccess = ["Admin", "SuperAdmin", "Membre"].some((role) =>
    roles.includes(role)
  );

  // Fonction pour vérifier si l'utilisateur a voté
  const checkUserVote = useCallback(
    async (pollId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/poll/${pollId}/vote-status/${userId}`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la vérification du vote");
        const data = await response.json();

        // Mise à jour du statut de vote
        setVoteStatuses((prev) => ({
          ...prev,
          [pollId]: data || { voted: false, optionId: null },
        }));
      } catch (error) {
        console.error(
          "Erreur lors de la vérification du vote utilisateur:",
          error
        );
        setErrorMessage("Erreur lors de la vérification du vote.");
      }
    },
    [userId]
  );

  // Récupère les derniers sondages
  useEffect(() => {
    async function fetchPolls() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/poll/latest`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des sondages");
        const data = await response.json();
        setPolls(data);

        // Définit le premier sondage comme sélectionné par défaut
        if (data.length > 0) {
          setSelectedPoll(data[0].id);
        }

        // Vérifie si l'utilisateur a voté pour chaque sondage
        if (userId) {
          data.forEach((poll) => {
            if (!voteStatuses[poll.id]) {
              checkUserVote(poll.id);
            }
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des sondages:", error);
        setErrorMessage("Erreur lors de la récupération des sondages.");
      }
    }

    if (status === "authenticated" && userId) {
      fetchPolls();
    }
  }, [userId, checkUserVote, status, voteStatuses]);

  useEffect(() => {
    async function fetchNews() {
      try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/information/latest`);
        const data = await response.json();
        setNews(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des news:", error);
        setErrorMessage("Erreur lors de la récupération des informations.");
      }
    }
    if (status === "authenticated" && userId) {
      fetchNews();
    }
  }, [status, userId

  ])

  // Gestion du vote
  const handleVote = async (pollId, optionId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poll/vote/${pollId}/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ optionId }),
        }
      );
      if (!response.ok) throw new Error("Erreur lors du vote");
      const data = await response.json();

      // Met à jour directement sans rappeler checkUserVote
      setVoteStatuses((prev) => ({
        ...prev,
        [pollId]: { voted: true, optionId: data.optionId },
      }));
    } catch (error) {
      setErrorMessage(
        "Une erreur est survenue lors du vote. Veuillez réessayer."
      );
      console.error("Erreur lors du vote:", error);
    }
  };

  return (
    <>
      {hasAccess ? (
        <div>
        <div>
          <h1>Derniers Sondages</h1>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <ul>
            {polls.map((poll) => (
              <li key={poll.id}>
                <Link href={'#'}
                  onClick={() =>
                    setSelectedPoll(poll.id === selectedPoll ? null : poll.id)
                  }
                >
                  {poll.question}
                </Link>

                {/* Affiche les options si l'utilisateur n'a pas voté */}
                {selectedPoll === poll.id && voteStatuses[poll.id]?.voted === false && (
                  <div>
                    <PollDetails pollId={poll.id} onVote={handleVote} />
                  </div>
                )}

                {/* Affiche les résultats si l'utilisateur a déjà voté */}
                {selectedPoll === poll.id && voteStatuses[poll.id]?.voted === true && (
                  <div>
                    <PollResults
                      pollId={poll.id}
                      optionId={voteStatuses[poll.id].optionId}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
        <h2>Dernières news</h2>
        <ul>
          {news.map((item) => (
            <li key={item.id}>
              {/* Ajout d'un événement onClick pour sélectionner la news */}
              <Link href={"#"}
                onClick={() => setSelectedNewsId(item.id === selectedNewsId ? null : item.id)}
              >
                {item.title}
              </Link >

              {/* Si la news est sélectionnée, afficher son contenu */}
              {selectedNewsId === item.id && (
                <div>
                  <p>{item.contain}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
        </div>
      ) : (
        <p>
          Vous ne devriez pas être ici ! Revenez à la page d&apos;
          <Link href="/">accueil</Link>
        </p>
      )}
    </>
  );
}
