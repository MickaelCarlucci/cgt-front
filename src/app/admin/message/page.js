"use client"
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fetchWithToken } from "../../utils/fetchWithToken";
import "./page.css";

export default function Page() {
    const { data: session } = useSession();
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState([""]); // Tableau de contenus
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState(null);

    const roles = session?.user?.roles?.split(", ") || [];
    const userId = session?.user?.id;
    const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
        roles.includes(role)
    );

    // Gestion des contenus multiples
    const handleContentChange = (index, value) => {
        const updatedContents = [...contents];
        updatedContents[index] = value;
        setContents(updatedContents);
    };

    const handleAddContent = () => {
        setContents([...contents, ""]); // Ajouter un nouveau champ de texte
    };

    const handleRemoveContent = (index) => {
        const updatedContents = contents.filter((_, i) => i !== index);
        setContents(updatedContents);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('contain', contents.join('|')); // Convertir le tableau en chaîne séparée par des virgules
        formData.append('image', imageFile); // Ajouter l'image
        formData.append('sectionId', 4);

        try {
            const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_API_URL}/api/information/news/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                  },
                body: formData, // Envoyer formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API error:", errorData);
                setError(errorData.error || "Une erreur est survenue.");
                return;
            }

            setTitle("");
            setContents([""]); // Remet à zéro le tableau de contenus
            setImageFile(null); // Réinitialiser l'image sélectionnée
            setError(""); // Réinitialiser l'erreur en cas de succès

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

                        <label>Contenu
                            {contents.map((content, index) => (
                                <div key={index}>
                                    <textarea
                                        value={content}
                                        onChange={(e) => handleContentChange(index, e.target.value)}
                                    />
                                    {contents.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveContent(index)}>
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={handleAddContent}>
                                Ajouter un paragraphe
                            </button>
                        </label>

                        <label>Image (optionnel)
                            <input
                                type="file"
                                onChange={(e) => setImageFile(e.target.files[0])}
                            />
                        </label>

                        {error && <p style={{ color: "red" }}>{error}</p>}
                        <button type="submit">Envoyer</button>
                    </form>
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
