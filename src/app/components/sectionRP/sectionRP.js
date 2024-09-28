"use client";

import { useState, useEffect } from 'react';
import { fetchWithToken } from "../utils/fetchWithToken";
import Link from 'next/link';
import './sectionRP.css';

export default function SectionRP() {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDoc() {
            try {
                const response = await fetchWithToken(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/8`
                );
                const data = await response.json();
                setDocuments(data)
            } catch (error) {
                console.error("Erreur lors de la récuparation des documents");
                setError("Erreur lors de la récuparation des documents")
            }
        }
        fetchDoc();
    }, [])
    
  return (
    <>
    <div>
        <h2>Documents RP</h2>
        {error && <p style={{ color: "red" }}>Erreur : {error}</p>}
      <ul>
        {documents.map((document) => (
            <li key={document.id}>{document.title}{" "} <Link
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/download/${document.pdf_url
              .split("/")
              .pop()}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button>Télécharger le PDF</button>
          </Link></li>
        ))}
      </ul>
    </div>
    </>
  )
}
