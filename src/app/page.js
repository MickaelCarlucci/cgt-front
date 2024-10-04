"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PdfViewer from "./components/pdfViewer/pdfViewer";
import { fetchWithToken } from "./utils/fetchWithToken";
import { convertFromRaw } from "draft-js";
import { stateToHTML } from "draft-js-export-html"; // Pour la conversion du contenu Draft.js en HTML
import "./page.css";

// Fonction pour convertir le contenu Draft.js brut en HTML
const convertRawContentToHTML = (rawContent) => {
  const contentState = convertFromRaw(rawContent);

  // Configuration pour les entités (comme les liens)
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

      // Gérer les couleurs (exemple : COLOR_#cb3434)
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
          customStyles.style = {
            ...customStyles.style,
            textDecoration: "underline",
          };
        }
      });

      return customStyles;
    },
  };

  return stateToHTML(contentState, options);
};

export default function Page() {
  const [documents, setDocuments] = useState([]); // Pour stocker les résultats combinés de la requête
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fonction pour récupérer les documents combinés
    async function fetchDocuments() {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/information/news` // L'API qui exécute la requête UNION
        );
        const data = await response.json();
        setDocuments(data); // Stocke les résultats de la requête combinée
        setError(null); // Réinitialise l'erreur
      } catch (err) {
        setError("Erreur lors de la récupération des documents");
        console.error("Erreur lors de la récupération des documents:", err);
      }
    }
    fetchDocuments();
  }, []);

  const parseContent = (content) => {
    if (typeof content === "string") {
      try {
        // Essaie de parser la chaîne JSON
        const parsedContent = JSON.parse(content);
        return parsedContent;
      } catch (error) {
        console.error("Erreur lors du parsing JSON :", error);
        return null;
      }
    }
    return content; // Si c'est déjà un objet, on le retourne
  };

  return (
    <>
      <h1 className="title-homepage">
        Bienvenue sur le site de la CGT Teleperformance France
      </h1>
      {error && <p className="error">{error}</p>}

      <div className="container">
        {/* Boucle sur les documents combinés provenant de la table information et leaflet_stored */}
        {documents.map((doc) => (
          <div className="div-homepage" key={doc.id}>
            <h2>{doc.title}</h2>

            {/* Vérifie si le document provient de la table `information` ou `leaflet_stored` */}
            {doc.source === "information" ? (
              <div className="div-information">
                {/* Gère le contenu Draft.js pour la table information */}
                {doc.contain ? (
                  (() => {
                    const parsedContent = parseContent(doc.contain);
                    if (parsedContent && parsedContent.blocks) {
                      return (
                        <div
                          className="content-text"
                          dangerouslySetInnerHTML={{
                            __html: convertRawContentToHTML(parsedContent),
                          }}
                        />
                      );
                    } else {
                      return (
                        <p>
                          Le contenu n&apos;est pas disponible ou est mal
                          formaté.
                        </p>
                      );
                    }
                  })()
                ) : (
                  <p>Le contenu n&apos;est pas disponible</p>
                )}

                {/* Affiche l'image si disponible */}
                {doc.image_url && (
  <div className="image-container">
    <div className="image-wrapper">
      <Image
        src={`${process.env.NEXT_PUBLIC_API_URL}${doc.image_url}`}
        alt="Une image syndicaliste"
        layout="fill"  // Remplit tout l'espace du conteneur
        objectFit="contain"  // Recadre l'image pour couvrir le conteneur sans déformation
      />
    </div>
  </div>
)}
              </div>
            ) : (
              <div>
                {/* Gère le lecteur PDF pour la table leaflet_stored */}
                {doc.pdf_url ? (
                  <>
                  <div className="pdf-container">
                    <PdfViewer
                      file={`${process.env.NEXT_PUBLIC_API_URL}${doc.pdf_url}`}
                    />
                    </div>
                    <div>
                      <Link
                        href={`${
                          process.env.NEXT_PUBLIC_API_URL
                        }/api/pdf/download/${doc.pdf_url.split("/").pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button>Télécharger le PDF</button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <p>PDF non disponible</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
