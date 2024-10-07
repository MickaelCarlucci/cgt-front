"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fetchWithToken } from "../../utils/fetchWithToken";
import { Editor, EditorState, RichUtils, convertToRaw, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";
import "./page.css";

// Fonction utilitaire pour valider une URL et ajouter http si nécessaire
const isValidUrl = (string) => {
  try {
    // Si l'URL ne contient pas de schéma (http ou https), ajouter http:// par défaut
    if (!/^https?:\/\//i.test(string)) {
      string = "http://" + string; // Ajouter http:// si l'URL n'a pas de schéma
    }
    new URL(string); // Vérifier si c'est une URL valide après ajout du schéma
    return string; // Retourner l'URL corrigée
  } catch (_) {
    return false;
  }
};

export default function Page() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("")
  const [editorStates, setEditorStates] = useState([EditorState.createEmpty()]); // tableau d'états d'éditeurs
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [currentColor, setCurrentColor] = useState("#000000"); // Couleur sélectionnée

  // Ref pour l'éditeur pour éviter le problème de "focus"
  const editorRefs = useRef([]);

  const roles = session?.user?.roles?.split(", ") || [];
  const userId = session?.user?.id;
  const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
    roles.includes(role)
  );

  // Fonction pour appliquer des styles comme gras/italique
  const handleKeyCommand = (command, index) => {
    const newState = RichUtils.handleKeyCommand(editorStates[index], command);
    if (newState) {
      handleContentChange(index, newState);
      return "handled";
    }
    return "not-handled";
  };

  // Gestion du changement de contenu pour chaque éditeur
  const handleContentChange = (index, editorState) => {
    const updatedEditorStates = [...editorStates];
    updatedEditorStates[index] = editorState;
    setEditorStates(updatedEditorStates);
  };

  // Fonction pour appliquer la couleur sélectionnée au texte
  const applyColor = (index) => {
    const selection = editorStates[index].getSelection();
    const contentState = editorStates[index].getCurrentContent();

    const newContentState = Modifier.applyInlineStyle(
      contentState,
      selection,
      `COLOR_${currentColor}` // On applique un style inline avec la couleur sélectionnée
    );

    const newEditorState = EditorState.push(editorStates[index], newContentState, "change-inline-style");
    handleContentChange(index, newEditorState);
  };

  // Fonction pour appliquer un lien hypertexte à partir du texte sélectionné
  const applyLink = (index) => {
    const selection = editorStates[index].getSelection();
    
    // Vérifier qu'une sélection existe
    if (!selection.isCollapsed()) {
      const url = prompt("Veuillez entrer l'URL du lien :");
      
      // Vérifier si l'URL est valide
      const validUrl = isValidUrl(url);
      if (validUrl) {
        const contentState = editorStates[index].getCurrentContent();
        
        // Créer l'entité de lien sur l'URL validée
        const contentStateWithLink = contentState.createEntity("LINK", "MUTABLE", { href: validUrl });
        const entityKey = contentStateWithLink.getLastCreatedEntityKey();
    
        // Appliquer l'entité au texte sélectionné
        const newContentState = Modifier.applyEntity(contentState, selection, entityKey);
    
        // Mettre à jour l'état de l'éditeur
        const newEditorState = EditorState.push(editorStates[index], newContentState, "apply-entity");
        handleContentChange(index, newEditorState);
      } else {
        alert("L'URL entrée n'est pas valide.");
      }
    } else {
      alert("Veuillez sélectionner un texte à transformer en lien.");
    }
  };
  
  
  
  

  // Fonction pour appliquer un soulignement au texte sélectionné
  const applyUnderline = (index) => {
    const newEditorState = RichUtils.toggleInlineStyle(editorStates[index], "UNDERLINE");
    handleContentChange(index, newEditorState);
  };

  // Fonction pour convertir l'état de l'éditeur en texte brut avant envoi
  const convertEditorStateToHTML = (editorState) => {
    const contentState = editorState.getCurrentContent();
    return JSON.stringify(convertToRaw(contentState)); // Envoi au format JSON
  };

  useEffect(() => {
    async function fetchSection() {
      try {
        const response = await fetchWithToken(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/sections`
        )
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des sections");
        const data = await response.json();
        setSections(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des sections:", error);
        setError("Erreur lors de la récupération des sections.");
      }
    }
    if (status === "authenticated" && userId) {
      fetchSection();
    }
  }, [status, userId])

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    const contentsInHTML = editorStates.map((editorState) =>
      convertEditorStateToHTML(editorState)
    );
    formData.append("contain", contentsInHTML); // Conversion en chaîne
    formData.append("image", imageFile);
    formData.append("sectionId", selectedSection);

    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/information/news/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Une erreur est survenue.");
        return;
      }

      setTitle("");
      setEditorStates([EditorState.createEmpty()]); // Réinitialiser les éditeurs
      setImageFile(null);
      setError("");
    } catch (error) {
      setError("Erreur lors de la soumission.");
    }
  };

  // Style personnalisé pour appliquer la couleur et le style des liens
  const customStyleMap = {
    [`COLOR_${currentColor}`]: {
      color: currentColor, // Applique la couleur sélectionnée
    },
    UNDERLINE: {
      textDecoration: "underline", // Applique le soulignement
    },
    LINK_COLOR: {
      color: "#1e90ff", // Applique une couleur spécifique pour les liens
    },
  };

  return (
    <>
      {hasAccess ? (
        <div style={{ margin: "20px" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-message" style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
            <label style={{ marginBottom: "5px" }}>Titre de la News:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Votre titre..."
              required
              style={{ padding: "5px", width: "300px" }}
            />
          </div>
      
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {editorStates.map((editorState, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Boutons pour Gras, Italique, etc. */}
                <div className="editor-text">
                  <button
                    type="button"
                    onClick={() => handleContentChange(index, RichUtils.toggleInlineStyle(editorStates[index], 'BOLD'))}
                    style={{ padding: "5px 10px", marginRight: "5px" }}
                  >
                    Gras
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContentChange(index, RichUtils.toggleInlineStyle(editorStates[index], 'ITALIC'))}
                    style={{ padding: "5px 10px", marginRight: "5px" }}
                  >
                    Italique
                  </button>
                  <button
                    type="button"
                    onClick={() => applyLink(index)}
                    style={{ padding: "5px 10px" }}
                  >
                    Ajouter Lien
                  </button>
                  <button
                    type="button"
                    onClick={() => applyUnderline(index)}
                    style={{ padding: "5px 10px", marginLeft: "5px" }}
                  >
                    Souligner
                  </button>
                </div>
      
                <div
                  style={{
                    minHeight: "150px",
                    border: "1px solid #ccc",
                    padding: "10px",
                    backgroundColor: "#fff",
                    cursor: "text",
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Empêche l'interférence avec d'autres clics
                    editorRefs.current[index]?.focus();
                  }} // Utilisation de ref pour gérer le focus
                >
                  <Editor
                    ref={(element) => (editorRefs.current[index] = element)} // Stocke la référence à l'éditeur
                    editorState={editorState}
                    onChange={(newState) => handleContentChange(index, newState)}
                    handleKeyCommand={(command) => handleKeyCommand(command, index)}
                    customStyleMap={customStyleMap} // Appliquer les styles personnalisés
                    placeholder="Écrivez votre contenu ici..."
                  />
                </div>
                {/* Sélecteur de couleur */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    style={{ marginRight: "10px" }}
                  />
                  <button
                    type="button"
                    onClick={() => applyColor(index)}
                    style={{ padding: "5px 10px" }}
                  >
                    Appliquer couleur
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="selector-message">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              required
            >
              <option value="" disabled>Selectionnez une section</option>
              {sections.filter((section) => section.id === 6 || section.id === 11).map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Image (optionnel):
              </label>
              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
                style={{ marginLeft: "10px" }}
              />
          </div>
      
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button className="button-message" type="submit">Envoyer</button>
        </form>
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
