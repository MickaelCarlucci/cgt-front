"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import PdfViewer from "./components/pdfViewer/pdfViewer";
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
  const containerRef = useRef(null); // Référence pour observer les div-homepage

  useEffect(() => {
    // Fonction pour récupérer les documents combinés
    async function fetchDocuments() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/information/news`
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

  // Observer pour l'animation d'apparition
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Ajoute la classe 'appear' si l'élément entre dans le viewport
            entry.target.classList.add("appear");
          } else {
            // Retire la classe 'appear' si l'élément sort du viewport
            entry.target.classList.remove("appear");
          }
        });
      },
      {
        threshold: Array.from(Array(101).keys(), (x) => x / 100), // Gamme de 0% à 100%
      }
    );

    const items = containerRef.current.querySelectorAll(".div-homepage");
    items.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      items.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, [documents]);

  const parseContent = (content) => {
    if (typeof content === "string") {
      try {
        const parsedContent = JSON.parse(content);
        return parsedContent;
      } catch (error) {
        console.error("Erreur lors du parsing JSON :", error);
        return null;
      }
    }
    return content;
  };

  return (
    <>
      <h1 className="title-homepage">
        Bienvenue sur le site de la CGT Teleperformance France
      </h1>
      {error && <p className="error">{error}</p>}

      <div className="container" ref={containerRef}>
        {/* Boucle sur les documents combinés provenant de la table information et leaflet_stored */}
        {documents.map((doc) => (
          <div className="div-homepage" key={doc.id}>
            {console.log("PDF URL:", `${process.env.NEXT_PUBLIC_API_URL}${doc.pdf_url}`)}
            <h2>{doc.title}</h2>

            {doc.source === "information" ? (
              <div className="div-information">
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

                {doc.image_url && (
                  <div className="image-container">
                    <div className="image-wrapper">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${doc.image_url}`}
                        alt="Une image syndicaliste"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
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
                  <p className="connected">PDF non disponible</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
