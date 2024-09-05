"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [centers, setCenters] = useState([]);
  const [centerId, setCenterId] = useState("");
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [error, setError] = useState("");

  const roles = session?.user?.roles?.split(", ") || [];

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
        setError("Erreur lors de la récupération des centres");
      }
    };
    sectionFetch();
  }, []);

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
    formData.append("section_id", sectionId); // Utilise sectionId ici
    formData.append("center_id", centerId); // Utilise centerId ici

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },

          body: formData,
        }
      );

      if (response.ok) {
        setMessage("Fichier téléchargé avec succès");
        setFile(null);
        setCenterId("");
        setSectionId("");
        e.target.reset(); // Réinitialiser le formulaire HTML
      } else {
        setMessage("Erreur lors du téléchargement du fichier");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage("Erreur lors du téléchargement du fichier");
    }
  };

  return (
    <>
        {roles.includes("Admin") || roles.includes("SuperAdmin") ? (
    <div className="container-add-file">

      <h1>Uploader un PDF</h1>
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
          Dans quel section je dois ranger le document ?:
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
    ) : ( 
    <p>
        Vous ne devriez pas être ici ! Revenez à la page d&apos;
        <Link href="/">accueil</Link>
      </p>
    )}
    </>
  );
}
