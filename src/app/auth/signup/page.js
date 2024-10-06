"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import {  MdVisibility, MdVisibilityOff } from "react-icons/md";
import "./page.css";

export default function Page() {
  const [pseudo, setPseudo] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [firstQuestion, setFirstQuestion] = useState("");
  const [firstAnswer, setFirstAnswer] = useState("");
  const [secondQuestion, setSecondQuestion] = useState("");
  const [secondAnswer, setSecondAnswer] = useState("");
  const [centerId, setCenterId] = useState("");
  const [centers, setCenters] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const router = useRouter();


  useEffect(() => {
    // Fonction pour récupérer les centres depuis l'API
    const fetchCenters = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`
        );
        const data = await response.json();
        setCenters(data);
      } catch (error) {
        setError("Erreur lors de la récupération des centres.");
      }
    };

    fetchCenters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const userData = {
      pseudo,
      firstname,
      lastname,
      mail,
      password,
      firstQuestion,
      firstAnswer,
      secondQuestion,
      secondAnswer,
      centerId,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      // Vérifier le statut de la réponse et le message
    if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Une erreur est survenue.");
        setMessage("");
        return;
      }
  
      const data = await response.json();
      setMessage(data.message || "Mail d'inscription envoyé !");
      setError("");
  
      // Redirection après succès
      setTimeout(() => {
        router.push('/auth');  // Redirige vers une page de succès ou autre
      }, 3000); // 3 secondes de délai
    } catch (error) {
      setError("Erreur lors de la soumission.");
      setMessage("");
      console.error("Submission Error:", error); // Ajoutez cette ligne pour déboguer
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>
            Pseudonyme:
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Prénom:
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Nom:
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group email-case">
          <label>
            Mail:
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="password-group" >
        <div className="input-group">

        <label style={{ position: "relative", display: "inline-block" }}>
      Mot de passe:
      <input
        type={passwordType}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <span
        style={{
          position: "absolute",
          right: "10px",
          top: "65%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          color: "black"
        }}
        onClick={togglePasswordVisibility}
      >
        {passwordType === "password" ? <MdVisibility /> : <MdVisibilityOff />}
      </span>
    </label>

        </div>
        <div className="input-group password-confirm">
          <label>
            Confirmez votre mot de passe:
            <input
              type={passwordType}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </label>
        </div>
        </div>
        <div className="input-group">
          <label>
            Question 1
            <input
              type="text"
              value={firstQuestion}
              onChange={(e) => setFirstQuestion(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Ecrivez la réponse à votre question pour récupérer votre mot de passe (attention les Majuscules et
            miniscules ont de l&apos;importance):
            <input
              type="text"
              value={firstAnswer}
              onChange={(e) => setFirstAnswer(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Question 2
            <input
              type="text"
              value={secondQuestion}
              onChange={(e) => setSecondQuestion(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Ecrivez la réponse à votre question (attention les Majuscules et
              miniscules ont de l&apos;importance):
            <input
              type="text"
              value={secondAnswer}
              onChange={(e) => setSecondAnswer(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Veuillez selectionner votre centre de rattachement:
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
        </div>
        <button className="button-signin" type="submit">
          S&apos;inscrire
        </button>
        <div className="bottom-text">
          {message && <p style={{ color: "green" }}>{message}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </form>
    </div>
  );
}
