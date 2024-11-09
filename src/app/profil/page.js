"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../utils/authSlice";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  updatePassword,
  deleteUser,
} from "firebase/auth";

import Link from "next/link";
import { MdMode, MdVisibility, MdVisibilityOff } from "react-icons/md";
import Modal from "../components/modal/modal";
import { fetchWithToken } from "../utils/fetchWithToken";
import Loader from "../components/Loader/Loader";
import "./page.css";
import { firebaseAuth } from "../../../firebaseConfig";

export default function Page() {
  const { user, loading } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);
  const [centers, setCenters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [passwordType, setPasswordType] = useState("password");
  const [emailUpdateRequested, setEmailUpdateRequested] = useState(false);
  const [error, setError] = useState(""); // État pour stocker les messages d'erreur
  const router = useRouter();
  const dispatch = useDispatch();

  const roles = user?.roles?.split(", ") || []; //vérifie l'état pour ne pas afficher d'erreur
  const hasAccess = [
    "Admin",
    "SuperAdmin",
    "Moderateur",
    "DS",
    "CSE",
    "CSSCT",
    "RP",
  ].some((role) => roles.includes(role));

  // États pour les modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [additionalValue, setAdditionalValue] = useState("");
  const [passwordConfirmValue, setPassworConfirmValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && user.id) {
          const [userResponse, centersResponse, activitiesResponse] =
            await Promise.all([
              fetchWithToken(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/findUserProfile/${user.id}`
              ),
              fetchWithToken(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`
              ),
              fetchWithToken(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${user.center_id}/activities`
              ),
            ]);

          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(
              errorData.error ||
                "Erreur lors de la récupération des données utilisateur."
            );
          }

          if (!centersResponse.ok) {
            const errorData = await centersResponse.json();
            throw new Error(
              errorData.error || "Erreur lors de la récupération des centres."
            );
          }

          if (!activitiesResponse.ok) {
            const errorData = await activitiesResponse.json();
            throw new Error(
              errorData.error || "Erreur lors de la récupération des activités."
            );
          }

          const userData = await userResponse.json();
          const centersData = await centersResponse.json();
          const activitiesData = await activitiesResponse.json();

          setUserData(userData);
          setCenters(centersData);
          setActivities(activitiesData);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    if (user && user.id) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const checkEmailVerification = async () => {
      const user = firebaseAuth.currentUser;

      await user.reload();

      if (user.emailVerified) {
        try {
          await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userData.id}/mail`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mail: user.email }),
            }
          );
          setError("Votre email a été mis à jour avec succès.");
          setEmailUpdateRequested(false); // Reset l'état une fois mis à jour
        } catch (error) {
          setError(
            "Erreur lors de la mise à jour de l'email dans la base de données : " +
              error.message
          );
        }
      }
    };

    if (emailUpdateRequested && userData && firebaseAuth.currentUser) {
      checkEmailVerification();
    }

    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user && emailUpdateRequested && userData) {
        checkEmailVerification();
      }
    });

    return () => unsubscribe();
  }, [emailUpdateRequested, userData]);

  // Mise à jour des activités lorsque le centre change
  useEffect(() => {
    const fetchActivities = async () => {
      if (modalField === "center_id" && inputValue) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${inputValue}/activities`
          );
          if (response.ok) {
            const data = await response.json();
            setActivities(data); // Mettre à jour les activités en fonction du centre sélectionné
          } else {
            setError("Erreur lors de la récupération des activités.");
          }
        } catch (error) {
          setError(error.message);
        }
      }
    };

    fetchActivities();
  }, [inputValue, modalField]);

  const handleMouseDown = () => {
    setPasswordType("text");
  };

  const handleMouseUp = () => {
    setPasswordType("password");
  };

  const openModal = (field) => {
    setModalField(field);
    setInputValue(userData[field]); // Pré-remplir l'input avec la valeur actuelle
    setAdditionalValue("");
    setPassworConfirmValue("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalField("");
    setError(""); // Réinitialiser l'erreur lors de la fermeture de la modal
  };

  const getCenterName = (centerId) => {
    const center = centers.find((center) => center.id === +centerId);
    return center ? center.name : "Centre non trouvé";
  };

  const getActivityName = (activityId) => {
    const activity = activities.find((activity) => activity.id === +activityId);
    return activity ? activity.name : "Activité non trouvée";
  };

  const handleSave = async () => {
    try {
      let response = null; // Initialise response à null

      // Appel API spécifique en fonction du champ modifié
      switch (modalField) {
        case "pseudo":
          response = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/pseudo`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ pseudo: inputValue }),
            }
          );
          break;

        case "firstname":
          response = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/firstname`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ firstname: inputValue }),
            }
          );
          break;

        case "lastname":
          response = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/lastname`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ lastname: inputValue }),
            }
          );
          break;

        case "phone":
          response = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/phone`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ phone: inputValue }),
            }
          );
          break;

        case "password":
          if (additionalValue !== passwordConfirmValue) {
            setError("Les mots de passe ne correspondent pas.");
            return;
          }
          try {
            // Vérifier l'ancien mot de passe
            await signInWithEmailAndPassword(
              firebaseAuth,
              userData.mail,
              inputValue
            );

            // Mettre à jour le mot de passe dans Firebase
            await updatePassword(firebaseAuth.currentUser, additionalValue);
          } catch (error) {
            // Gère uniquement les erreurs de signInWithEmailAndPassword et updatePassword
            setError(
              "Erreur lors de la mise à jour du mot de passe : " + error.message
            );
            return;
          }
          break;

        case "center_id":
          response = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/center`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                center_id: inputValue,
              }),
            }
          );
          break;

        case "activity_id":
          response = await fetchWithToken(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/activity`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                activity_id: inputValue,
              }),
            }
          );
          break;

        case "delete":
          try {
            // Supprimer l'utilisateur de la base de données
            response = await fetchWithToken(
              `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/delete`,
              {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mail: inputValue }),
              }
            );

            // Supprimer l'utilisateur de Firebase
            await deleteUser(firebaseAuth.currentUser);

            if (response?.ok) {
              // Vérifiez que response est défini avant de vérifier ok
              dispatch(logoutUser());
              router.push("/auth");
              return;
            }
          } catch (error) {
            setError(
              "Erreur lors de la suppression du compte : " + error.message
            );
            return;
          }
          break;

        default:
          console.error("Aucune route API correspondante pour ce champ.");
          return;
      }

      // Vérifiez que response n'est pas null avant d'accéder à response.ok
      if (response && !response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json(); // Récupérer l'erreur renvoyée par l'API
          throw new Error(
            errorData.error || "Erreur lors de la sauvegarde des modifications."
          );
        } else {
          // Si la réponse n'est pas du JSON, créer un message d'erreur générique
          throw new Error("Le format attendu n'est pas correct.");
        }
      }

      // Mettre à jour les données utilisateur après modification
      setUserData((prevData) => ({
        ...prevData,
        [modalField]: inputValue,
      }));

      closeModal(); // Fermer la modal après la sauvegarde
    } catch (error) {
      setError(error.message); // Stocker le message d'erreur dans l'état
    }
  };

  if (loading) return <Loader />; // Afficher un message de chargement si l'utilisateur n'est pas encore défini

  return (
    <>
      {user ? (
        <>
          {userData ? (
            <div className="container-profile">
              <div className="title-profile">
                <h1>Bonjour, {userData.pseudo} !</h1>
                <p>
                  Si tu veux mettre à jour tes informations, clique sur
                  l&apos;icône <MdMode /> à côté du champ que tu souhaites
                  modifier.
                </p>
              </div>

              <h2>Mes informations:</h2>
              <div className="information-profile">
                <div className="element-profil">
                  Mon pseudonyme:{" "}
                  <span>
                    {userData.pseudo}{" "}
                    <MdMode
                      className="pen-icon"
                      onClick={() => openModal("pseudo")}
                    />
                  </span>
                </div>
                <div className="element-profil">
                  Mon Prénom:{" "}
                  <span>
                    {userData.firstname}{" "}
                    <MdMode
                      className="pen-icon"
                      onClick={() => openModal("firstname")}
                    />
                  </span>
                </div>
                <div className="element-profil">
                  Mon Nom:{" "}
                  <span>
                    {userData.lastname}{" "}
                    <MdMode
                      className="pen-icon"
                      onClick={() => openModal("lastname")}
                    />
                  </span>
                </div>
                {hasAccess ? (
                  <div className="element-profil">
                    Mon numéro de téléphone:{" "}
                    <span>
                      {userData.phone}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("phone")}
                      />
                    </span>
                  </div>
                ) : null}
                <div className="element-profil">
                  Changer mon mot de passe{" "}
                  <span>
                    <MdMode
                      className="pen-icon"
                      onClick={() => openModal("password")}
                    />
                  </span>
                </div>
                <div className="element-profil">
                  Centre de rattachement:{" "}
                  <span>
                    {getCenterName(userData.center_id)}{" "}
                    <MdMode
                      className="pen-icon"
                      onClick={() => openModal("center_id")}
                    />
                  </span>
                </div>
                <div className="element-profil">
                  Activité principale:{" "}
                  <span>
                    {getActivityName(userData.activity_id)}{" "}
                    <MdMode
                      className="pen-icon"
                      onClick={() => openModal("activity_id")}
                    />
                  </span>
                </div>
                <div
                  className="element-profil delete-profil"
                  onClick={() => openModal("delete")}
                >
                  Supprimer mon compte{" "}
                </div>
              </div>

              {/* Modal pour modifier un champ */}
              {(modalField !== "password" ||
                modalField !== "center_id" ||
                modalField !== "activity_id") && (
                <Modal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  title={`Modifier`}
                >
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />

                  <button onClick={handleSave}>Sauvegarder</button>
                </Modal>
              )}

              {modalField === "center_id" && (
                <Modal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  title={`Modifier`}
                >
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <select
                    value={inputValue} // Assurez-vous que inputValue correspond bien à l'ID du centre sans affichage direct
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Sélectionner un centre
                    </option>
                    {centers.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleSave}>Sauvegarder</button>
                </Modal>
              )}

              {modalField === "activity_id" && (
                <Modal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  title={`Modifier`}
                >
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <select
                    value={inputValue} // Assurez-vous que inputValue correspond bien à l'ID du centre sans affichage direct
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Sélectionner une activité
                    </option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleSave}>Sauvegarder</button>
                </Modal>
              )}

              {modalField === "password" && (
                <Modal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  title={`Modifier`}
                >
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <label>Mot de passe actuel:</label>
                    <input
                      type={passwordType}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "10px",
                        cursor: "pointer",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {passwordType === "password" ? (
                        <MdVisibility />
                      ) : (
                        <MdVisibilityOff />
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <label>Nouveau mot de passe</label>
                    <input
                      type={passwordType}
                      value={additionalValue}
                      onChange={(e) => setAdditionalValue(e.target.value)}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "10px",
                        cursor: "pointer",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {passwordType === "password" ? (
                        <MdVisibility />
                      ) : (
                        <MdVisibilityOff />
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <label>Confirmez le mot de passe</label>
                    <input
                      type={passwordType}
                      value={passwordConfirmValue}
                      onChange={(e) => setPassworConfirmValue(e.target.value)}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "10px",
                        cursor: "pointer",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {passwordType === "password" ? (
                        <MdVisibility />
                      ) : (
                        <MdVisibilityOff />
                      )}
                    </span>
                  </div>
                  <button onClick={handleSave}>Sauvegarder</button>
                </Modal>
              )}

              {modalField === "delete" && (
                <Modal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  title={`Modifier`}
                >
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <label>
                    Saisissez votre adresse mail pour confirmer la suppression:
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button onClick={handleSave}>Sauvegarder</button>
                </Modal>
              )}
            </div>
          ) : (
            <p className="connected">
              Erreur lors de la récupération des données utilisateur.
            </p>
          )}
        </>
      ) : (
        <p className="connected">
          Veuillez vous connecter à votre compte <Link href="/auth">ici</Link>
        </p>
      )}
    </>
  );
}
