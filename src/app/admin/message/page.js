"use client";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { fetchWithToken } from "../../utils/fetchWithToken";
import { useRouter } from "next/navigation";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import Loader from "@/app/components/Loader/Loader";
import "./page.css";

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

export default function Page() {
  const { user, loading } = useSelector((state) => state.auth);
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [editorStates, setEditorStates] = useState([EditorState.createEmpty()]);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [currentColor, setCurrentColor] = useState("#000000");

  const editorRefs = useRef([]);

  const roles = user?.roles?.split(", ") || [];
  const userId = user?.id;
  const hasAccess = ["Admin", "SuperAdmin", "Moderateur"].some((role) =>
    roles.includes(role)
  );

  const applyBlockAlignment = (index, alignment) => {
    const contentState = editorStates[index].getCurrentContent();
    const selection = editorStates[index].getSelection();

    const newContentState = Modifier.setBlockData(contentState, selection, {
      textAlign: alignment,
    });

    const newEditorState = EditorState.push(
      editorStates[index],
      newContentState,
      "change-block-data"
    );

    handleContentChange(index, newEditorState);
  };

  const blockStyleFn = (contentBlock) => {
    const textAlign = contentBlock.getData().get("textAlign");
    switch (textAlign) {
      case "left":
        return "align-left";
      case "center":
        return "align-center";
      case "right":
        return "align-right";
      case "justify":
        return "align-justify";
      default:
        return "";
    }
  };

  const handleKeyCommand = (command, index) => {
    const newState = RichUtils.handleKeyCommand(editorStates[index], command);
    if (newState) {
      handleContentChange(index, newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleContentChange = (index, editorState) => {
    const updatedEditorStates = [...editorStates];
    updatedEditorStates[index] = editorState;
    setEditorStates(updatedEditorStates);
  };

  const applyColor = (index) => {
    const selection = editorStates[index].getSelection();
    const contentState = editorStates[index].getCurrentContent();

    const newContentState = Modifier.applyInlineStyle(
      contentState,
      selection,
      `COLOR_${currentColor}`
    );

    const newEditorState = EditorState.push(
      editorStates[index],
      newContentState,
      "change-inline-style"
    );
    handleContentChange(index, newEditorState);
  };

  const applyLink = (index) => {
    const selection = editorStates[index].getSelection();

    if (!selection.isCollapsed()) {
      const url = prompt("Veuillez entrer l'URL du lien :");

      const validUrl = isValidUrl(url);
      if (validUrl) {
        const contentState = editorStates[index].getCurrentContent();

        const contentStateWithLink = contentState.createEntity(
          "LINK",
          "MUTABLE",
          { href: validUrl }
        );
        const entityKey = contentStateWithLink.getLastCreatedEntityKey();

        const newContentState = Modifier.applyEntity(
          contentState,
          selection,
          entityKey
        );

        const newEditorState = EditorState.push(
          editorStates[index],
          newContentState,
          "apply-entity"
        );
        handleContentChange(index, newEditorState);
      } else {
        alert("L'URL entrée n'est pas valide.");
      }
    } else {
      alert("Veuillez sélectionner un texte à transformer en lien.");
    }
  };

  const applyUnderline = (index) => {
    const newEditorState = RichUtils.toggleInlineStyle(
      editorStates[index],
      "UNDERLINE"
    );
    handleContentChange(index, newEditorState);
  };

  const convertEditorStateToHTML = (editorState) => {
    const contentState = editorState.getCurrentContent();
    return JSON.stringify(convertToRaw(contentState));
  };

  useEffect(() => {
    async function fetchSection() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/sections`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des sections");
        const data = await response.json();
        setSections(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sections:", error);
        setError("Erreur lors de la récupération des sections.");
      }
    }
    if (user && userId) {
      fetchSection();
    }
  }, [user, userId]);

  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    const contentsInHTML = editorStates.map((editorState) =>
      convertEditorStateToHTML(editorState)
    );
    formData.append("contain", contentsInHTML);
    formData.append("image", imageFile);
    formData.append("sectionId", selectedSection);

    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/information/news/${userId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Une erreur est survenue.");
        return;
      }

      router.push("/");
    } catch (error) {
      setError("Erreur lors de la soumission.");
    }
  };

  const customStyleMap = {
    [`COLOR_${currentColor}`]: {
      color: currentColor,
    },
    UNDERLINE: {
      textDecoration: "underline",
    },
    LINK_COLOR: {
      color: "#1e90ff",
    },
  };

  if (loading) return <Loader />;

  return (
    <>
      {hasAccess ? (
        <div style={{ margin: "20px" }}>
          <form onSubmit={handleSubmit}>
            <div
              className="form-message"
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
              }}
            >
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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              {editorStates.map((editorState, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div className="editor-text">
                    <button
                      type="button"
                      onClick={() => applyBlockAlignment(index, "left")}
                      style={{ padding: "5px 10px", marginRight: "5px" }}
                    >
                      Aligner à gauche
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBlockAlignment(index, "center")}
                      style={{ padding: "5px 10px", marginRight: "5px" }}
                    >
                      Centrer
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBlockAlignment(index, "right")}
                      style={{ padding: "5px 10px", marginRight: "5px" }}
                    >
                      Aligner à droite
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBlockAlignment(index, "justify")}
                      style={{ padding: "5px 10px", marginRight: "5px" }}
                    >
                      Justifier
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleContentChange(
                          index,
                          RichUtils.toggleInlineStyle(
                            editorStates[index],
                            "BOLD"
                          )
                        )
                      }
                      style={{ padding: "5px 10px", marginRight: "5px" }}
                    >
                      Gras
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleContentChange(
                          index,
                          RichUtils.toggleInlineStyle(
                            editorStates[index],
                            "ITALIC"
                          )
                        )
                      }
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
                    className="div-editor-text-message"
                    style={{
                      minHeight: "150px",
                      border: "1px solid #ccc",
                      padding: "10px",
                      cursor: "text",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      editorRefs.current[index]?.focus();
                    }}
                  >
                    <Editor
                      ref={(element) => (editorRefs.current[index] = element)}
                      editorState={editorState}
                      onChange={(newState) =>
                        handleContentChange(index, newState)
                      }
                      handleKeyCommand={(command) =>
                        handleKeyCommand(command, index)
                      }
                      blockStyleFn={blockStyleFn}
                      customStyleMap={customStyleMap}
                      placeholder="Écrivez votre contenu ici..."
                    />
                  </div>

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
                <option value="" disabled>
                  Selectionnez une section
                </option>
                {sections
                  .filter((section) => section.id === 6 || section.id === 11)
                  .map((section) => (
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
            <button className="button-message" type="submit">
              Envoyer
            </button>
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
