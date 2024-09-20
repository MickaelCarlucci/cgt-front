"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TfiTrash } from "react-icons/tfi";
import Link from "next/link";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [pdfs, setPdfs] = useState([]);
  const [error, setError] = useState();

  const roles = session?.user?.roles?.split(", ") || []; //vérifie l'état de session pour ne pas afficher d'erreur
  const hasAccess = ["Admin", "SuperAdmin"].some((role) =>
    roles.includes(role)
  );
  const userId = session?.user?.id;


  useEffect(() => {
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
    if (status === "authenticated" && userId) {
      fetchPdfs();
    }
  },[status, userId]);

  const handleDelete = async(pdfId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdf/delete/${pdfId}`, {
        method: "DELETE",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                  },
      });
      if (response.ok) {
        // Mettre à jour la liste des fichiers après suppression
        setPdfs(pdfs.filter(pdf => pdf.id !== pdfId));
    } else {
        console.error('Erreur lors de la suppression du fichier');
    }
    } catch (error) {
      setError(
        "Une erreur est survenue lors de la suppression. Veuillez réessayer."
      );
      console.error("Erreur lors de la suppression:", error);
  }
  };

  return
   <div>

   </div>;
}
