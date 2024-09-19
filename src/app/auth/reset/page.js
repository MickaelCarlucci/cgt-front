"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css";

export default function Page() {
  const [mail, setMail] = useState("");
  const [firstQuestion, setFirstQuestion] = useState(null);
  const [secondQuestion, setSecondQuestion] = useState(null);
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false); // Ajout de cet état pour afficher le formulaire de mot de passe
  const router = useRouter();

  const handleMailSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/users/findUser?email=${encodeURIComponent(mail.toLowerCase())}`
      );

      if (!response.ok) {
        throw new Error("Utilisateur introuvable");
      }

      const data = await response.json();
      setFirstQuestion(data.first_question);
      setSecondQuestion(data.second_question);
    } catch (err) {
      setError(err.message);
      setFirstQuestion(null);
      setSecondQuestion(null);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const answerData = {
      mail,
      answer1,
      answer2,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answerData),
        }
      );

      if (!response.ok) {
        throw new Error("Réponses incorrectes ou erreur serveur");
      }

      const data = await response.json();
      if (data) {
        setFirstQuestion(null);
        setSecondQuestion(null);
        setShowPasswordForm(true); // Activer l'affichage du formulaire de mot de passe
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const newPasswordData = {
      mail,
      password,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/password/reseting`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPasswordData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du mot de passe");
      }

      // Rediriger ou afficher un message de succès après la mise à jour du mot de passe
      router.push("/auth"); // Par exemple, redirige vers la page de connexion
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1>Réinitialiser le mot de passe</h1>
    {!showPasswordForm && (

        <>
         <div className="login-container">
          <form className="login-form" onSubmit={handleMailSubmit}>
          <div className="input-group">
            <label>
              Entrez votre adresse email :
              <input
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)} // Mettre à jour l'email dans le state
                required
              />
            </label>
            </div>
            <button className="button-signin" type="submit">Vérifier</button>
          </form>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* Si les questions sont trouvées, on les affiche */}
          {firstQuestion && (
            <div className="login-container">
              <form className="login-form" onSubmit={handleResetSubmit}>
                <p>{firstQuestion}</p>
                <div className="input-group">
                  <label>
                    (Attention aux majuscules et minuscules)
                    <input
                      type="text"
                      value={answer1}
                      onChange={(e) => setAnswer1(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <p>{secondQuestion}</p>
                <div className="input-group">
                  <label>
                    (Attention aux majuscules et minuscules)
                    <input
                      type="text"
                      value={answer2}
                      onChange={(e) => setAnswer2(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <button className="button-signin" type="submit">
                  Validez
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {showPasswordForm && (
        <div className="login-container">
          <h2>Saississez votre nouveau mot de passe :</h2>
          <form className="login-form" onSubmit={handleNewPasswordSubmit}>
            <div className="input-group">
              <label>
                Nouveau mot de passe :
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="input-group">
          <label>
            Confirmez votre mot de passe:
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
        </div>
      )}
    </>
  );
}