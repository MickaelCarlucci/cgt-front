"use client"
import { useSession } from "next-auth/react";
import { fetchWithToken } from "../utils/fetchWithToken";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import PollDetails from "../components/optionPoll/page";
import PollResults from "../components/resultPoll/page";
import './page.css';

export default function Page() {
    const { data: session, status } = useSession()

    const roles = session?.user?.roles?.split(", ") || [];
    const userId = session?.user?.id;
  
    const [polls, setPolls] = useState([]);
    const [selectedPoll, setSelectedPoll] = useState(null); // Initialisé à null
    const [voteStatuses, setVoteStatuses] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);

    const hasAccess = ["Admin", "SuperAdmin", "Membre", "Moderateur", "DS", "CSE", "CSSCT", "RP"].some((role) =>
        roles.includes(role)
      );

      const checkUserVote = useCallback(
        async (pollId) => {
          try {
            const response = await fetchWithToken(
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
        const response = await fetchWithToken(
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

  // Gestion du vote
  const handleVote = async (pollId, optionId) => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/poll/vote/${pollId}/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
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
          <div className="poll">
            <h1>Derniers Sondages</h1>
            {errorMessage && <p className="error">{errorMessage}</p>}
              {polls.map((poll) => (
                <div className="poll-container" key={poll.id}>
                  <Link
                    href={"#"}
                    onClick={() =>
                      setSelectedPoll(poll.id === selectedPoll ? null : poll.id)
                    }
                  >
                    {poll.question}
                  </Link>

                  {/* Affiche les options si l'utilisateur n'a pas voté */}
                  {selectedPoll === poll.id &&
                    voteStatuses[poll.id]?.voted === false && (
                      <div>
                        <PollDetails pollId={poll.id} onVote={handleVote} />
                      </div>
                    )}

                  {/* Affiche les résultats si l'utilisateur a déjà voté */}
                  {selectedPoll === poll.id &&
                    voteStatuses[poll.id]?.voted === true && (
                      <div>
                        <PollResults
                          pollId={poll.id}
                          optionId={voteStatuses[poll.id].optionId}
                        />
                      </div>
                    )}
                </div>
              ))}
          </div>
        </div>
      ) : (
        <p>
          Si vous souhaitez consulter cette page, merci de vous connecter{" "}
          <Link href="/auth"> ici</Link>
        </p>
      )}
    </>
  )
}
