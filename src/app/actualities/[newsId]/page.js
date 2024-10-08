"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Editor, EditorState, RichUtils, convertFromRaw, convertToRaw, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";
import { fetchWithToken } from "../../utils/fetchWithToken";
import { useParams } from "next/navigation";
import Link from "next/link";
import './page.css';

// Fonction utilitaire pour valider une URL et ajouter http si nécessaire
const isValidUrl = (string) => {
  try {
    if (!/^https?:\/\//i.test(string)) {
      string = "http://" + string;
    }
    new URL(string); 
    return string;
  } catch (_) {
    return false;
  }
};

export default function EditNewsPage() {
  const params = useParams();
  const { newsId } = params;
  const { data: session } = useSession();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentColor, setCurrentColor] = useState("#000000");
  const editorRef = useRef();

  const roles = session?.user?.roles?.split(", ") || [];
  const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
    roles.includes(role)
  );

  useEffect(() => {
    if (newsId && session) {
      async function fetchNews() {
        try {
          const response = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/information/news/${newsId}`
          );
          const data = await response.json();

          if (data) {
            setTitle(data.title);
            if (data.contain) {
              const rawContent = JSON.parse(data.contain);
              const contentState = convertFromRaw(rawContent);
              setEditorState(EditorState.createWithContent(contentState));
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de la news:", error);
          setError("Erreur lors de la récupération de la news.");
        } finally {
          setIsLoading(false);
        }
      }
      fetchNews();
    }
  }, [newsId, session]);

  // Fonction pour mettre à jour uniquement le titre
  const handleTitleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/information/news/${newsId}/updateTitle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newTitle: title }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Titre mis à jour avec succès.");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Une erreur est survenue lors de la mise à jour du titre.");
      }
    } catch (error) {
      setError("Erreur lors de la mise à jour du titre.");
    }
  };

  // Fonction pour mettre à jour uniquement le contenu
  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const rawContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));

    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/information/news/${newsId}/updateContain`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newContain: rawContent }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Contenu mis à jour avec succès.");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Une erreur est survenue lors de la mise à jour du contenu.");
      }
    } catch (error) {
      setError("Erreur lors de la mise à jour du contenu.");
    }
  };

  const handleContentChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  // Appliquer les styles gras, italique, souligné
  const applyInlineStyle = (style) => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, style);
    setEditorState(newEditorState);
  };

  // Appliquer un lien hypertexte
  const applyLink = () => {
    const selection = editorState.getSelection();

    if (!selection.isCollapsed()) {
      const url = prompt("Veuillez entrer l'URL du lien :");

      const validUrl = isValidUrl(url);
      if (validUrl) {
        const contentState = editorState.getCurrentContent();
        const contentStateWithLink = contentState.createEntity("LINK", "MUTABLE", { href: validUrl });
        const entityKey = contentStateWithLink.getLastCreatedEntityKey();
        const newContentState = Modifier.applyEntity(contentState, selection, entityKey);
        const newEditorState = EditorState.push(editorState, newContentState, "apply-entity");
        setEditorState(newEditorState);
      } else {
        alert("L'URL entrée n'est pas valide.");
      }
    } else {
      alert("Veuillez sélectionner un texte à transformer en lien.");
    }
  };

  const applyColor = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    const newContentState = Modifier.applyInlineStyle(
      contentState,
      selection,
      `COLOR_${currentColor}`
    );

    const newEditorState = EditorState.push(editorState, newContentState, "change-inline-style");
    setEditorState(newEditorState);
  };

  const customStyleMap = {
    [`COLOR_${currentColor}`]: {
      color: currentColor,
    },
    UNDERLINE: {
      textDecoration: "underline",
    },
  };

  if (isLoading) {
    return <p>Chargement des données de la news...</p>;
  }

  return (
    <>
    {hasAccess ? (
    <div className="main-content-newsId" style={{ margin: "20px" }}>
      <h1>Modifier la news</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      {/* Formulaire pour le titre */}
      <form className="form-update-header" onSubmit={handleTitleSubmit}>
        <label>
          Titre de la news:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
          />

        <button type="submit" style={{ marginTop: "20px", padding: "10px 20px" }}>
          Sauvegarder le titre
        </button>
      </form>

      {/* Formulaire pour le contenu */}
      <form onSubmit={handleContentSubmit} style={{ marginTop: "20px" }}>
        <div style={{ margin: "20px 0" }}>
          <h3 className="h3-contain-update">Contenu de la news:</h3>
          {/* Barre d'outils */}
          <div className="editor-buttons">
            <button className="editor-text-id" type="button" onClick={() => applyInlineStyle("BOLD")} style={{ padding: "5px 10px", marginRight: "5px" }}>
              Gras
            </button>
            <button className="editor-text-id" type="button" onClick={() => applyInlineStyle("ITALIC")} style={{ padding: "5px 10px", marginRight: "5px" }}>
              Italique
            </button>
            <button className="editor-text-id" type="button" onClick={applyLink} style={{ padding: "5px 10px", marginRight: "5px" }}>
              Ajouter lien
            </button>
            <button className="editor-text-id" type="button" onClick={() => applyInlineStyle("UNDERLINE")} style={{ padding: "5px 10px", marginRight: "5px" }}>
              Souligner
            </button>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              style={{ marginRight: "10px" }}
            />
            <button className="editor-text-id" type="button" onClick={applyColor} style={{ padding: "5px 10px" }}>
              Appliquer couleur
            </button>
          </div>

          {/* Éditeur de contenu */}
          <div className="text-news-contain"
            style={{
              minHeight: "150px",
              border: "1px solid #ccc",
              padding: "10px",
              backgroundColor: "#fff",
              cursor: "text",
            }}
            onClick={() => editorRef.current?.focus()}
          >
            <Editor
              ref={editorRef}
              editorState={editorState}
              onChange={handleContentChange}
              customStyleMap={customStyleMap}
              placeholder="Modifiez le contenu de la news ici..."
            />
          </div>
        </div>

        <button className="button-save-update" type="submit" style={{ marginTop: "20px", padding: "10px 20px" }}>
          Sauvegarder le contenu
        </button>
      </form>
    </div>
    ):(
      <p className="connected">Vous ne devriez pas être ici, merci de retourner à l&apos;<Link href={"/"}>accueil</Link></p>
  )}
    </>
  );
}
