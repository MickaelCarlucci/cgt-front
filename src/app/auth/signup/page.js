"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { firebaseAuth } from "../../../../firebaseConfig"; // Assurez-vous que firebase-config est correctement configuré
import "./page.css";

export default function Page() {
  const [pseudo, setPseudo] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [centerId, setCenterId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [centers, setCenters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const router = useRouter();

  // Récupération de la liste des centres
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

  // Récupération des activités liées au centre sélectionné
  useEffect(() => {
    const fetchActivities = async () => {
      if (centerId) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${centerId}/activities`
          );
          const data = await response.json();
          setActivities(data);
        } catch (error) {
          setError("Erreur lors de la récupération des activités.");
        }
      }
    };
    fetchActivities();
  }, [centerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // Création de l'utilisateur Firebase et récupération de l'UID
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        mail,
        password
      );
      const firebaseUID = userCredential.user.uid;
      const user = userCredential.user;

      // Envoi de l'e-mail de vérification
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/verify-email`,
      });
      console.log("E-mail de vérification envoyé à : ", user.email);

      setMessage(
        "Inscription réussie ! Un e-mail de vérification a été envoyé. Veuillez vérifier votre boîte de réception."
      );

      // Enregistrement de l'utilisateur dans votre base de données
      const userData = {
        pseudo,
        firstname,
        lastname,
        mail,
        firebaseUID,
        centerId,
        activityId,
      };

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
      setMessage(
        data.message ||
          "Inscription réussie ! Un e-mail de vérification a été envoyé."
      );
      setError("");

      // Redirection après succès
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      setError("Erreur lors de l'inscription : " + error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
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
                {passwordType === "password" ? (
                  <MdVisibility />
                ) : (
                  <MdVisibilityOff />
                )}
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
