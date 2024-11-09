"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import Loader from "../components/Loader/Loader";
import "./page.css";

export default function DocumentPage() {
  const [pdfs, setPdfs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [cseDocuments, setCseDocuments] = useState([]);
  const [RPDocuments, setRPDocuments] = useState([]);
  const [CSSCTDocuments, setCSSCTDocuments] = useState([]);
  const [utilsDocuments, setUtilsDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null); // Nouvelle variable pour gérer la section active
  const { user, loading } = useSelector((state) => state.auth);

  const roles = user?.roles?.split(", ") || [];
  const hasAccess = [
    "Admin",
    "SuperAdmin",
    "Membre",
    "Moderateur",
    "DS",
    "CSE",
    "CSSCT",
    "RP",
  ].some((role) => roles.includes(role));

  // Regrouper tous les fetch dans un seul useEffect et vérifier l'authentification
  useEffect(() => {
    if (user) {
      const fetchAllDocuments = async () => {
        try {
          const [pdfRes, docRes, cseRes, rpRes, cssctRes, utilsRes] =
            await Promise.all([
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/1`),
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/2`),
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/3`),
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/4`),
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/5`),
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views/10`),
            ]);

          const [pdfData, docData, cseData, rpData, cssctData, utilsData] =
            await Promise.all([
              pdfRes.json(),
              docRes.json(),
              cseRes.json(),
              rpRes.json(),
              cssctRes.json(),
              utilsRes.json(),
            ]);

          setPdfs(pdfData);
          setDocuments(docData);
          setCseDocuments(cseData);
          setRPDocuments(rpData);
          setCSSCTDocuments(cssctData);
          setUtilsDocuments(utilsData);
          setError(null);
        } catch (err) {
          setError("Erreur lors de la récupération des documents");
          console.error("Erreur lors de la récupération des documents:", err);
        }
      };

      fetchAllDocuments();
    }
  }, [user]);

  // Fonction pour basculer entre l'affichage et la fermeture des sections
  const toggleSection = (sectionName) => {
    setActiveSection(activeSection === sectionName ? null : sectionName);
  };

  if (loading) return <Loader />;

  return (
    <>
      {hasAccess ? (
        <div className="contain-documents-page">
          <h1>Documents relatifs à l&apos;entreprise</h1>
          <p>(Cliquez sur le document de votre choix pour le télécharger)</p>
          {error && <p style={{ color: "red" }}>Erreur : {error}</p>}

          <div className="navigation">
            <h3 onClick={() => toggleSection("utils")}>
              Documents utiles {activeSection === "utils" ? "▲" : "▼"}
            </h3>
            {activeSection === "utils" && (
              <ul>
                {utilsDocuments.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL
                      }/api/pdf/download/${doc.pdf_url.split("/").pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="navigation">
            <h3 onClick={() => toggleSection("accords")}>
              Liste des accords d&apos;entreprise{" "}
              {activeSection === "accords" ? "▲" : "▼"}
            </h3>
            {activeSection === "accords" && (
              <ul>
                {pdfs.map((pdf) => (
                  <li key={pdf.id}>
                    <Link
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL
                      }/api/pdf/download/${pdf.pdf_url.split("/").pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      {pdf.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="navigation">
            <h3 onClick={() => toggleSection("tracts")}>
              Liste des tracts {activeSection === "tracts" ? "▲" : "▼"}
            </h3>
            {activeSection === "tracts" && (
              <ul>
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL
                      }/api/pdf/download/${doc.pdf_url.split("/").pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="navigation">
            <h3 onClick={() => toggleSection("cse")}>
              Documents relatifs au Comité Social et Economique{" "}
              {activeSection === "cse" ? "▲" : "▼"}
            </h3>
            {activeSection === "cse" && (
              <ul>
                {cseDocuments.map((cse) => (
                  <li key={cse.id}>
                    <Link
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL
                      }/api/pdf/download/${cse.pdf_url.split("/").pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      {cse.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="navigation">
            <h3 onClick={() => toggleSection("rp")}>
              Documents relatifs aux Représentants de Proximité{" "}
              {activeSection === "rp" ? "▲" : "▼"}
            </h3>
            {activeSection === "rp" && (
              <ul>
                {RPDocuments.map((RP) => (
                  <li key={RP.id}>
                    <Link
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL
                      }/api/pdf/download/${RP.pdf_url.split("/").pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      {RP.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="navigation">
            <h3 onClick={() => toggleSection("cssct")}>
              Documents relatifs à la Commission Santé, Sécurité et Conditions
              de Travail {activeSection === "cssct" ? "▲" : "▼"}
            </h3>
            {activeSection === "cssct" && (
              <ul>
                {CSSCTDocuments.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL
                      }/api/pdf/download/${doc.pdf_url.split("/").pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <p className="connected">
          Si vous souhaitez consulter cette page, merci de vous connecter{" "}
          <Link href="/auth">ici</Link>
        </p>
      )}
    </>
  );
}
