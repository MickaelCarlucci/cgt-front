"use client";

import { useState, useEffect } from "react";
import PdfViewer from "../components/pdfViewer/pdfViewer";
import Link from "next/link";

export default function DocumentPage() {
  const [pdfs, setPdfs] = useState([]); // Pour les fichiers PDF
  const [documents, setDocuments] = useState([]); // Pour les fichiers Word
  const [cseDocuments, setCseDocuments] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [error, setError] = useState(null); // Initialisation à null


  // Récupérer les PDF (accords)
  useEffect(() => {
    async function fetchPdfs() {
      try {
        const res = await fetch(
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/2`
        );
        const data = await res.json();
        setDocuments(data);
        setError(null); // Réinitialiser l'erreur si la récupération a réussi
      } catch (err) {
        setError("Erreur lors de la récupération des documents");
        console.error(
          "Erreur lors de la récupération des documents:",
          err
        );
      }
    }

    fetchDocs();
  }, []);



    // Récupérer les fichiers Word (tracts)
    useEffect(() => {
      async function fetchDocsCSE() {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/3`
          );
          const data = await res.json();
          setCseDocuments(data);
          setError(null); // Réinitialiser l'erreur si la récupération a réussi
        } catch (err) {
          setError("Erreur lors de la récupération des documents");
          console.error(
            "Erreur lors de la récupération des documents:",
            err
          );
        }
      }
  
      fetchDocsCSE();
    }, []);

  return (
    <div>
      <div>
        <h1>Liste des accords</h1>
        <ul>
          {pdfs.map((pdf) => (
            <li key={pdf.id}>
              <button
                onClick={() =>
                  setSelectedPdf(
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
                  setSelectedPdf(
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
        <h1>Liste des Documents relatif au CSE</h1>
        <ul>
          {cseDocuments.map((cse) => (
            <li key={cse.id}>
              <button
                onClick={() =>
                  setSelectedPdf(
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
      href={`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/download/${selectedPdf.split('/').pop()}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <button>Télécharger le PDF</button>
    </Link>
  </div>
        </div>
      )}
    </div>
  );
}
