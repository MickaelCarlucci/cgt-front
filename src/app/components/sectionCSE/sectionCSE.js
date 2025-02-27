"use client";

import { useState, useEffect } from "react";
import { fetchWithToken } from "../../utils/fetchWithToken";
import Link from "next/link";
import "./sectionCSE.css";

export default function SectionCSE() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/7`
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des documents");
        }

        const data = await response.json();
        setDocuments(data);
        setError(null);
      } catch (error) {
        console.error(error);
        setError("Erreur lors de la récupération des documents");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDoc();
  }, []);

  return (
    <div className="selected-section">
      <h2>Documents CSE</h2>

      {isLoading && <p>Chargement des documents...</p>}
      {error && <p style={{ color: "red" }}>Erreur : {error}</p>}

      {!isLoading && !error && documents.length === 0 && (
        <p>Aucun document disponible.</p>
      )}

      <ul>
        {documents.map((document) => {
          const pdfFileName = document.pdf_url?.split("/").pop();
          return (
            <li key={document.id}>
              {document.title}{" "}
              {pdfFileName ? (
                <Link
                  href={`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/download/${pdfFileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="download-button">Télécharger</button>
                </Link>
              ) : (
                <span>PDF non disponible</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
