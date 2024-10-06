"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { TfiTrash } from "react-icons/tfi"; // Icone pour supprimer
import { RiEditFill } from "react-icons/ri"; // Icone pour modifier
import { fetchWithToken } from "../utils/fetchWithToken";
import { convertFromRaw } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
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

const NewsList = ({ items, roles, handleDelete, selectedNewsId, setSelectedNewsId, title, type }) => {
  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href="#"
              onClick={() =>
                setSelectedNewsId(item.id === selectedNewsId ? null : item.id)
              }
            >
              {item.title}
            </Link>

            {(roles.includes("Admin") || roles.includes("SuperAdmin") || roles.includes("Moderateur")) && (
              <>
                <span
                  type="button"
                  onClick={() => handleDelete(item.id, type)} // Passez le type (news ou saviez-vous)
                  style={{ cursor: 'pointer', marginLeft: '10px' }}
                >
                  <TfiTrash />
                </span>

                <Link href={`/actualities/${item.id}`}>
                  <span style={{ cursor: 'pointer', marginLeft: '10px' }}>
                    <RiEditFill />
                  </span>
                </Link>
              </>
            )}

            {selectedNewsId === item.id && (
              <div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: convertRawContentToHTML(JSON.parse(item.contain)),
                  }}
                />
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
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};


export default function Page() {
  const { data: session, status } = useSession();
  const roles = session?.user?.roles?.split(", ") || [];
  const userId = session?.user?.id;

  const [news, setNews] = useState([]);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [didYouKnow, setDidYouKnow] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const hasAccess = ["Admin", "SuperAdmin", "Membre", "Moderateur", "DS", "CSE", "CSSCT", "RP"].some((role) =>
    roles.includes(role)
  );

  useEffect(() => {
    async function fetchData(apiPath, setData) {
      try {
        const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/information/${apiPath}`);
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setErrorMessage("Erreur lors de la récupération des informations.");
      }
    }

    if (status === "authenticated" && userId) {
      fetchData("latestNews", setNews);
      fetchData("latestDidYouKnow", setDidYouKnow);
    }
  }, [status, userId]);

  const handleDelete = async (id, type) => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/information/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (response.ok) {
        // Mettre à jour la bonne liste en fonction du type (news ou saviez-vous)
        if (type === "news") {
          setNews(news.filter((item) => item.id !== id));
        } else if (type === "didYouKnow") {
          setDidYouKnow(didYouKnow.filter((item) => item.id !== id));
        }
      } else {
        console.error("Erreur lors de la suppression de l'élément");
      }
    } catch (error) {
      setErrorMessage("Une erreur est survenue lors de la suppression. Veuillez réessayer.");
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    <>
      {hasAccess ? (
        <div>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <NewsList
  items={news}
  roles={roles}
  handleDelete={handleDelete}
  selectedNewsId={selectedNewsId}
  setSelectedNewsId={setSelectedNewsId}
  title="Dernières news"
  type="news" // Passez le type "news"
/>
<NewsList
  items={didYouKnow}
  roles={roles}
  handleDelete={handleDelete}
  selectedNewsId={selectedNewsId}
  setSelectedNewsId={setSelectedNewsId}
  title="Le saviez-vous ?"
  type="didYouKnow" // Passez le type "didYouKnow"
/>

        </div>
      ) : (
        <p className="connected">
          Si vous souhaitez consulter cette page, merci de vous connecter{" "}
          <Link href="/auth">ici</Link>.
        </p>
      )}
    </>
  );
}
