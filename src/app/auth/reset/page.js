"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { firebaseAuth } from "../../../../firebaseConfig";
import "./page.css";

export default function ResetPasswordPage() {
  const [mail, setMail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswordResetForm, setShowPasswordResetForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");
    if (oobCode) {
      setShowPasswordResetForm(true);
    }
  }, []);

  const handleMailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await sendPasswordResetEmail(firebaseAuth, mail);
      setSuccessMessage(
        "Un e-mail de réinitialisation a été envoyé. Veuillez vérifier votre boîte de réception."
      );
    } catch (err) {
      setError(
        "Erreur lors de l'envoi de l'e-mail de réinitialisation : " +
          err.message
      );
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");

    if (!oobCode) {
      setError("Code de réinitialisation manquant dans l'URL.");
      return;
    }

    try {
      await confirmPasswordReset(firebaseAuth, oobCode, newPassword);
      setSuccessMessage("Mot de passe mis à jour avec succès.");
      router.push("/auth");
    } catch (err) {
      setError(
        "Erreur lors de la mise à jour du mot de passe : " + err.message
      );
    }
  };

  return (
    <div className="reset-password-page">
      <h1>Réinitialiser le mot de passe</h1>

      {!showPasswordResetForm ? (
        <div className="login-container">
          <form className="login-form" onSubmit={handleMailSubmit}>
            <div className="input-group">
              <label>
                Entrez votre adresse email :
                <input
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  required
                />
              </label>
            </div>
            <button className="button-signin" type="submit">
              Envoyer le lien de réinitialisation
            </button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        </div>
      ) : (
        <div className="login-container">
          <h2>Entrez votre nouveau mot de passe</h2>
          <form className="login-form" onSubmit={handleNewPasswordSubmit}>
            <div className="input-group">
              <label>
                Nouveau mot de passe :
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="input-group">
              <label>
                Confirmez votre mot de passe :
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </label>
            </div>
            <button className="button-signin" type="submit">
              Mettre à jour le mot de passe
            </button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        </div>
      )}
    </div>
  );
}
