"use client"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import PdfViewer from "./components/pdfViewer/pdfViewer";
import "./page.module.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [information, setInformation] = useState(null);
  const [pdf, setPdf] = useState();
  const [error, setError] = useState();

  const roles = session?.user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin", "Membre"].some((role) =>
    roles.includes(role)
);

  useEffect(() => {
    async function fetchNews() {
      try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/information/news`);
        const data = await response.json();
        setInformation(data);

      } catch (error) {
        setError("Erreur lors de la soumission.");
        console.error("Submission Error:", error);
    }
    }
    fetchNews();
  }, [])

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/last`
        );
        const data = await res.json();
        setPdf(data);
        setError(null); // Réinitialiser l'erreur si la récupération a réussi
      } catch (err) {
        setError("Erreur lors de la récupération des documents");
        console.error(
          "Erreur lors de la récupération des documents:",
          err
        );
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
        <div> {information.contain.split("|").map((paragraph, index) => (
          <p key={index}> {paragraph.trim()} </p>
        ))} </div>
        {information.image_url && (
          <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}${info.image_url}`}
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
          href={`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/download/${pdf.pdf_url.split('/').pop()}`}
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
