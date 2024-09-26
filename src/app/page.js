"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import PdfViewer from "./components/pdfViewer/pdfViewer";
import { fetchWithToken } from "./utils/fetchWithToken";
import { convertFromRaw } from "draft-js";
import { stateToHTML } from "draft-js-export-html"; // Import pour la conversion du contenu Draft.js en HTML
import "./page.module.css";

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
            color: "#1e90ff", // Couleur spécifique pour les liens
            textDecoration: "underline", // Pour souligner les liens
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
            color: style.replace("COLOR_", ""), // Extrait la couleur hexadécimale
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

  // Convertir le ContentState en HTML avec les options personnalisées
  return stateToHTML(contentState, options);
};

export default function Page() {
  const { data: session } = useSession();
  const [information, setInformation] = useState(null);
  const [pdf, setPdf] = useState();
  const [error, setError] = useState();

  const roles = session?.user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin", "Membre"].some((role) =>
    roles.includes(role)
  );

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/information/news`
        );
        const data = await response.json();
        setInformation(data);
      } catch (error) {
        setError("Erreur lors de la soumission.");
        console.error("Submission Error:", error);
      }
    }
    fetchNews();
  }, []);

  const parseContent = (content) => {
    if (typeof content === "string") {
      try {
        // Essayons de parser la chaîne JSON
        const parsedContent = JSON.parse(content);
        return parsedContent;
      } catch (error) {
        console.error("Erreur lors du parsing JSON :", error);
        return null;
      }
    }
    // Si c'est déjà un objet, on le retourne tel quel
    return content;
  };

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/last`
        );
        const data = await res.json();
        setPdf(data);
        setError(null); // Réinitialiser l'erreur si la récupération a réussi
      } catch (err) {
        setError("Erreur lors de la récupération des documents");
        console.error("Erreur lors de la récupération des documents:", err);
      }
    }
    fetchDoc();
  }, []);

  return (
    <>
      <h1>Bienvenue sur le site de la CGT Teleperformance France</h1>
      {error && <p className="error">{error}</p>}

      <div>
        {information && (
          <div key={information.id}>
            <h2>{information.title}</h2>

            <div>
              {/* Vérifier si le contenu est une chaîne ou du contenu Draft.js */}
              {information.contain ? (
                // D'abord parser le contenu s'il s'agit d'une chaîne JSON
                (() => {
                  const parsedContent = parseContent(information.contain);
                  if (parsedContent && parsedContent.blocks) {
                    return (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: convertRawContentToHTML(parsedContent),
                        }}
                      />
                    );
                  } else {
                    return <p>Le contenu n'est pas disponible ou est mal formaté.</p>;
                  }
                })()
              ) : (
                <p>Le contenu n'est pas disponible</p>
              )}
            </div>

            {information.image_url && (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${information.image_url}`}
                alt="Une image syndicaliste"
                width={500}
                height={300}
                layout="intrinsic"
                objectFit="cover"
              />
            )}
          </div>
        )}
      </div>

      {hasAccess && pdf && (
        <div key={pdf.id}>
          <h2>{pdf.title}</h2>

          {/* Construction de l'URL complète du PDF et vérification que `pdf.pdf_url` est défini */}
          {pdf.pdf_url ? (
            <PdfViewer file={`${process.env.NEXT_PUBLIC_API_URL}${pdf.pdf_url}`} />
          ) : (
            <p>PDF non disponible</p>
          )}

          <div>
            {/* Vérification que pdf.pdf_url est bien défini avant de générer le lien de téléchargement */}
            {pdf.pdf_url && (
              <Link
                href={`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/download/${pdf.pdf_url
                  .split("/")
                  .pop()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button>Télécharger le PDF</button>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
