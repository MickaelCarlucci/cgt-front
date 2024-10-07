"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
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
  const [activityId, setActivityId] = useState(""); // Pour stocker l'activité choisie
  const [centers, setCenters] = useState([]);
  const [activities, setActivities] = useState([]); // Pour stocker les activités
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const router = useRouter();

  // Récupérer la liste des centres
  useEffect(() => {
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

  // Récupérer les activités une fois qu'un centre est sélectionné
  useEffect(() => {
    const fetchActivities = async () => {
      if (centerId) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}/activities`
          );
          const data = await response.json();
          setActivities(data); // Mettre à jour les activités liées au centre
        } catch (error) {
          setError("Erreur lors de la récupération des activités.");
        }
      }
    };

    fetchActivities();
  }, [centerId]); // Re-fetch des activités chaque fois que le centre change

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
      activityId, // Envoyer l'ID de l'activité avec les autres données
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
        router.push('/auth');
      }, 3000); 
    } catch (error) {
      setError("Erreur lors de la soumission.");
      setMessage("");
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

        {/* Section Mot de passe */}
        <div className="password-group">
          <div className="input-group">
            <label>
              Mot de passe:
              <input
                type={passwordType}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={togglePasswordVisibility}>
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

        {/* Section Question secrète */}
        <div className="input-group">
          <label>
            Question 1:
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
            Réponse 1 (Les majuscules et minuscules ont une importances):
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
            Question 2:
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
            Réponse 2 (Les majuscules et minuscules ont une importances):
            <input
              type="text"
              value={secondAnswer}
              onChange={(e) => setSecondAnswer(e.target.value)}
              required
            />
          </label>
        </div>

        {/* Sélection du centre */}
        <div className="input-group">
          <label>
            Sélectionnez votre centre:
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

        {/* Sélection de l'activité - Affiché uniquement si un centre est sélectionné */}
        {centerId && (
          <div className="input-group">
            <label>
              Sélectionnez votre activité:
              <select
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Sélectionnez une activité
                </option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

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
