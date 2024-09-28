"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PdfViewer from "../components/pdfViewer/pdfViewer";
import { fetchWithToken } from "../utils/fetchWithToken";
import Link from "next/link";
import './page.css'

export default function DocumentPage() {
  const [pdfs, setPdfs] = useState([]); // Pour les fichiers PDF
  const [documents, setDocuments] = useState([]); // Pour les fichiers Word
  const [cseDocuments, setCseDocuments] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [error, setError] = useState(null); // Initialisation à null
  const { data: session, status } = useSession();

  const roles = session?.user?.roles?.split(", ") || []; //vérifie l'état de session pour ne pas afficher d'erreur
  const hasAccess = ["Admin", "SuperAdmin", "Membre"].some((role) =>
    roles.includes(role)
  );

  // Récupérer les PDF (accords)
  useEffect(() => {
    async function fetchPdfs() {
      try {
        const res = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/1`
        );
        const data = await res.json();
        setPdfs(data);
        setError(null); // Réinitialiser l'erreur si la récupération a réussi
      } catch (err) {
        setError("Erreur lors de la récupération des documents");
        console.error("Erreur lors de la récupération des documents:", err);
      }
    }

    fetchPdfs();
  }, []);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/2`
        );
        const data = await res.json();
        setDocuments(data);
        setError(null); // Réinitialiser l'erreur si la récupération a réussi
      } catch (err) {
        setError("Erreur lors de la récupération des documents");
        console.error("Erreur lors de la récupération des documents:", err);
      }
    }

    fetchDocs();
  }, []);

  // Récupérer les tracts
  useEffect(() => {
    async function fetchDocsCSE() {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/3`
        );
        const data = await response.json();
        setCseDocuments(data);
        setError(null); // Réinitialiser l'erreur si la récupération a réussi
      } catch (err) {
        setError("Erreur lors de la récupération des documents");
        console.error("Erreur lors de la récupération des documents:", err);
      }
    }

    fetchDocsCSE();
  }, []);

  const handlePdfSelection = (pdfUrl) => {
    // Si le PDF sélectionné est le même que celui cliqué, le désélectionner
    if (selectedPdf === pdfUrl) {
      setSelectedPdf(null);
    } else {
      setSelectedPdf(pdfUrl);
    }
  };

  return (
    <>
      {hasAccess ? (
        <div>
          <div>
            <h1>Liste des accords</h1>
            <ul>
              {pdfs.map((pdf) => (
                <li key={pdf.id}>
                  <button
                    onClick={() =>
                      handlePdfSelection(
                        `${process.env.NEXT_PUBLIC_API_URL}${pdf.pdf_url}`
                      )
                    }
                  >
                    {pdf.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h1>Liste des tracts</h1>
            <ul>
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() =>
                      handlePdfSelection(
                        `${process.env.NEXT_PUBLIC_API_URL}${doc.pdf_url}`
                      )
                    }
                  >
                    {doc.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h1>Liste des Documents relatifs au CSE</h1>
            <ul>
              {cseDocuments.map((cse) => (
                <li key={cse.id}>
                  <button
                    onClick={() =>
                      handlePdfSelection(
                        `${process.env.NEXT_PUBLIC_API_URL}${cse.pdf_url}`
                      )
                    }
                  >
                    {cse.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {selectedPdf && (
            <div>
              {error && <p style={{ color: "red" }}>Erreur : {error}</p>}
              <h3>Visualisation du PDF</h3>
              <PdfViewer file={selectedPdf} />
              <div>
                {/* Lien pour télécharger le PDF via la nouvelle route du backend */}
                <Link
                  href={`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/download/${selectedPdf
                    .split("/")
                    .pop()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button>Télécharger le PDF</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>
          Si vous souhaitez consulter cette page, merci de vous connecter{" "}
          <Link href="/auth">ici</Link>
        </p>
      )}
    </>
  );
}
