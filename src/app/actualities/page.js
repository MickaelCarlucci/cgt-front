"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { TfiTrash } from "react-icons/tfi"; // Ajout de l'icône d'édition
import { RiEditFill } from "react-icons/ri";
import PollDetails from "../components/optionPoll/page";
import PollResults from "../components/resultPoll/page";
import { fetchWithToken } from "../utils/fetchWithToken";
import { convertFromRaw } from "draft-js";
import { stateToHTML } from "draft-js-export-html"; // Pour convertir le contenu Draft.js en HTML
import "./page.css";

// Fonction pour convertir le contenu Draft.js brut en HTML
const convertRawContentToHTML = (rawContent) => {
  const contentState = convertFromRaw(rawContent);

  const options = {
    entityStyleFn: (entity) => {
      const entityType = entity.getType();
      if (entityType === "LINK") {
        const data = entity.getData();
        return {
          element: "a",
          attributes: {
            href: data.href,
            target: "_blank",
          },
          style: {
            color: "#1e90ff",
            textDecoration: "underline",
          },
        };
      }
    },
    inlineStyleFn: (styles) => {
      const styleArray = styles.toArray();
      const customStyles = {};

      styleArray.forEach((style) => {
        if (style.startsWith("COLOR_")) {
          customStyles.style = {
            color: style.replace("COLOR_", ""),
          };
        }
        if (style === "BOLD") {
          customStyles.style = { ...customStyles.style, fontWeight: "bold" };
        }
        if (style === "ITALIC") {
          customStyles.style = { ...customStyles.style, fontStyle: "italic" };
        }
        if (style === "UNDERLINE") {
          customStyles.style = { ...customStyles.style, textDecoration: "underline" };
        }
      });

      return customStyles;
    },
  };

  return stateToHTML(contentState, options);
};

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

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/information/latest`
        );
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des news:", error);
        setErrorMessage("Erreur lors de la récupération des informations.");
      }
    }
    if (status === "authenticated" && userId) {
      fetchNews();
    }
  }, [status, userId]);

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

  const handleDelete = async (newsId) => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/information/delete/${newsId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (response.ok) {
        // Mettre à jour la liste des news après suppression
        setNews(news.filter((item) => item.id !== newsId));
      } else {
        console.error("Erreur lors de la suppression de la nouvelle");
      }
    } catch (error) {
      setErrorMessage(
        "Une erreur est survenue lors de la suppression. Veuillez réessayer."
      );
      console.error("Erreur lors de la suppression:", error);
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
                  <Link
                    href={"#"}
                    onClick={() =>
                      setSelectedNewsId(
                        item.id === selectedNewsId ? null : item.id
                      )
                    }
                  >
                    {item.title}
                  </Link>

                  {roles.includes("Admin") || roles.includes("SuperAdmin") && (
                    <>
                      {/* Lien de suppression */}
                      <Link href={"#"}>
                        <span
                          type="button"
                          onClick={() => handleDelete(item.id)}
                        >
                          <TfiTrash />
                        </span>
                      </Link>

                      {/* Lien de modification */}
                      <Link href={`/actualities/${item.id}`}>
                        <span>
                        <RiEditFill />
                        </span>
                      </Link>
                    </>
                  )}

                  {/* Si la news est sélectionnée, afficher son contenu */}
                  {selectedNewsId === item.id && (
                    <div>
                      {item.image_url && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${item.image_url}`}
                          alt="Une image syndicaliste"
                          width={500}
                          height={300}
                          layout="intrinsic"
                          objectFit="cover"
                        />
                      )}

                      {/* Convertir et afficher le contenu Draft.js en HTML */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: convertRawContentToHTML(JSON.parse(item.contain)),
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>
          Si vous souhaitez consulter cette page, merci de vous connecter{" "}
          <Link href="/auth"> ici</Link>
        </p>
      )}
    </>
  );
}
