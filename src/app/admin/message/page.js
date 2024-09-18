"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import "./page.css";

export default function Page() {
    const { data: session, status } = useSession();
    const [title, setTitle] = useState("");
    const [contain, setContain] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState(null);

    const roles = session?.user?.roles?.split(", ") || [];
    const userId = session?.user?.id;
    const hasAccess = ["Admin", "SuperAdmin"].some((role) =>
        roles.includes(role)
      );

      const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('title', title);
        formData.append('contain', contain);
        formData.append('image', imageFile); // Ajouter l'image
        formData.append('sectionId', 4);
    console.log(formData)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/information/new/${userId}`, {
                method: "POST",
                body: formData, // Envoyer formData
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API error:", errorData);
                setError(errorData.error || "Une erreur est survenue.");
                return;
            }
        } catch (error) {
            setError("Erreur lors de la soumission.");
            console.error("Submission Error:", error);
        }
    };


  return (
    <>
    {hasAccess ? (
    <div>
        <form onSubmit={handleSubmit}>
       <label>Titre de la News
        <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            />
       </label>
       <label>contenu
        <textarea 
            value={contain}
            onChange={(e) => setContain(e.target.value)} />
       </label>
       <label>Image (optionnel)
    <input 
        type="file"
        onChange={(e) => setImageFile(e.target.files[0])} // Utiliser un state pour stocker le fichier
    />
</label>
       {error && <p style={{ color: "red" }}>{error}</p>}
       <button type="submit">
        Envoyer
       </button>

        </form>
      
    </div>
     ) : (
        <p>
        Vous ne devriez pas être ici ! Revenez à la page d&apos;
        <Link href="/">accueil</Link>
      </p>
    )}

    </>
  )
}
