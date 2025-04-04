"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { TfiTrash } from "react-icons/tfi";
import { fetchWithToken } from "../../utils/fetchWithToken";
import Loader from "@/app/components/Loader/Loader";
import "./page.css";

export default function Page() {
  const { user, loading } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [message, setMessage] = useState("");
  const [centers, setCenters] = useState([]);
  const [centerId, setCenterId] = useState("");
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [error, setError] = useState("");

  const roles = user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
    roles.includes(role)
  );
  const userId = user?.id;

  useEffect(() => {
    const centerFetch = async () => {
      try {
        const centerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`
        );
        const centerData = await centerResponse.json();
        setCenters(centerData);
      } catch (error) {
        setError("Erreur lors de la récupération des centres");
      }
    };
    centerFetch();
  }, []);

  useEffect(() => {
    const sectionFetch = async () => {
      try {
        const sectionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/sections`
        );
        const sectionData = await sectionResponse.json();
        setSections(sectionData);
      } catch (error) {
        setError("Erreur lors de la récupération des sections");
      }
    };
    sectionFetch();
  }, []);

  const fetchPdfs = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/views`
      );
      const data = await response.json();
      setPdfs(data);
    } catch (error) {
      setError("Erreur lors de la récupération des fichiers");
    }
  };

  useEffect(() => {
    if (user && userId) {
      fetchPdfs();
    }
  }, [user, userId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Veuillez sélectionner un fichier");
      return;
    }

    if (!sectionId || !centerId) {
      setMessage("Veuillez sélectionner une section et un centre");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("section_id", sectionId);
    formData.append("center_id", centerId);

    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setMessage("Fichier téléchargé avec succès");
        setFile(null);
        setCenterId("");
        setSectionId("");
        e.target.reset();

        await fetchPdfs();
      } else {
        setMessage("Erreur lors du téléchargement du fichier");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage("Erreur lors du téléchargement du fichier");
    }
  };

  const handleDelete = async (pdfId) => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/delete/${pdfId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setPdfs(pdfs.filter((pdf) => pdf.id !== pdfId));
      } else {
        console.error("Erreur lors de la suppression du fichier");
      }
    } catch (error) {
      setError(
        "Une erreur est survenue lors de la suppression. Veuillez réessayer."
      );
      console.error("Erreur lors de la suppression:", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      {hasAccess ? (
        <div className="container">
          <div className="container-add-file">
            <h1>Uploader un fichier</h1>
            <form onSubmit={handleSubmit}>
              <input type="file" onChange={handleFileChange} />
              <label>
                Centre lié au document:
                <select
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Sélectionnez un centre
                  </option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dans quelle section ranger le document ?:
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Sélectionnez une section
                  </option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Upload</button>
            </form>
            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
          <div className="container-managePdf">
            <h2>Liste des documents</h2>
            <ul>
              {pdfs.map((pdf) => (
                <li key={pdf.id}>
                  {pdf.title}{" "}
                  <span type="button" onClick={() => handleDelete(pdf.id)}>
                    <TfiTrash />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="connected">
          Vous ne devriez pas être ici ! Revenez à la page d&apos;
          <Link href="/">accueil</Link>
        </p>
      )}
    </>
  );
}
