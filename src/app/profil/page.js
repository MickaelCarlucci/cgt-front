"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdMode, MdVisibility, MdVisibilityOff } from "react-icons/md";
import Modal from "../components/modal/modal";
import "./page.css";

export default function Page() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [centers, setCenters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [passwordType, setPasswordType] = useState("password");
  const [error, setError] = useState(""); // État pour stocker les messages d'erreur
  const router = useRouter();

  const roles = session?.user?.roles?.split(", ") || []; //vérifie l'état de session pour ne pas afficher d'erreur

  // États pour les modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [additionalValue, setAdditionalValue] = useState("");
  const [passwordConfirmValue, setPassworConfirmValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const [userResponse, centersResponse, activitiesResponse] =
            await Promise.all([
              fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/findUserProfile/${session.user.id}`
              ),
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/centers`),
              fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/center/${session.user.center_id}/activities`
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

    if (session?.user.id) {
      fetchData();
    }
  }, [session]);

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
      let response;

      // Appel API spécifique en fonction du champ modifié
      switch (modalField) {
        case "pseudo":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/pseudo`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ pseudo: inputValue }),
            }
          );
          break;

        case "firstname":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/firstname`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ firstname: inputValue }),
            }
          );
          break;

        case "lastname":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/lastname`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ lastname: inputValue }),
            }
          );
          break;

        case "mail":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/mail`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ mail: inputValue }),
            }
          );
          break;

        case "phone":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/phone`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
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
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/password/modify`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                oldPassword: inputValue,
                password: additionalValue,
              }),
            }
          );
          break;

        case "first_question":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/firstSecretSecurity`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                first_question: inputValue,
                first_answer: additionalValue,
              }),
            }
          );
          break;

        case "second_question":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/secondSecretSecurity`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                second_question: inputValue,
                second_answer: additionalValue,
              }),
            }
          );
          break;

        case "center_id":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/center`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                center_id: inputValue,
              }),
            }
          );
          break;

        case "activity_id":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/activity`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                activity_id: inputValue,
              }),
            }
          );
          break;

          case "delete":
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}/delete`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                mail: inputValue,
              }),
            }
          );
          // Si la suppression est réussie, redirigez l'utilisateur
          if (response.ok) {
            await signOut({ redirect: false });
            router.push('/auth'); // Redirige vers la page de connexion
            return;
          }
          break;

        default:
          console.error("Aucune route API correspondante pour ce champ.");
          return;
      }

      if (!response.ok) {
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

  return (
    <>
      {status === "authenticated" ? (
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

              <div className="information-profile">
                <h2>Mes informations:</h2>
                <ul>
                  <li>
                    Mon pseudonyme:{" "}
                    <span>
                      {userData.pseudo}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("pseudo")}
                      />
                    </span>
                  </li>
                  <li>
                    Mon Prénom:{" "}
                    <span>
                      {userData.firstname}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("firstname")}
                      />
                    </span>
                  </li>
                  <li>
                    Mon Nom:{" "}
                    <span>
                      {userData.lastname}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("lastname")}
                      />
                    </span>
                  </li>
                  <li>
                    Mon adresse mail:{" "}
                    <span>
                      {userData.mail}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("mail")}
                      />
                    </span>
                  </li>
                  {roles.includes("Admin") || roles.includes("Elus") ? (
                    <li>
                      Mon numéro de téléphone:{" "}
                      <span>
                        {userData.phone}{" "}
                        <MdMode
                          className="pen-icon"
                          onClick={() => openModal("phone")}
                        />
                      </span>
                    </li>
                  ) : null}
                  <li>
                    Changer mon mot de passe{" "}
                    <span>
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("password")}
                      />
                    </span>
                  </li>
                  <li>
                    Ma première question secrète:{" "}
                    <span>
                      {userData.first_question}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("first_question")}
                      />
                    </span>
                  </li>
                  <li>
                    Ma deuxième question secrète:{" "}
                    <span>
                      {userData.second_question}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("second_question")}
                      />
                    </span>
                  </li>
                  <li>
                    Centre de rattachement:{" "}
                    <span>
                      {getCenterName(userData.center_id)}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("center_id")}
                      />
                    </span>
                  </li>
                  <li>
                    Activité principale:{" "}
                    <span>
                      {getActivityName(userData.activity_id)}{" "}
                      <MdMode
                        className="pen-icon"
                        onClick={() => openModal("activity_id")}
                      />
                    </span>
                  </li>
                  <li>
                    Supprimer mon compte:{" "}
                    <span>
                     <MdMode
                        className="pen-icon"
                        onClick={() => openModal("delete")}
                      />
                    </span>
                  </li>
                </ul>
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

                  {(modalField === "first_question" ||
                    modalField === "second_question") && (
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <label>Réponse secrète:</label>
                      <input
                        type={passwordType}
                        value={additionalValue}
                        onChange={(e) => setAdditionalValue(e.target.value)}
                        style={{ paddingRight: "30px" }}
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
                  )}
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
                    value={inputValue}
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
                  <label>Saississez l&apos;adresse mail de l&apos;utilisateur pour confirmer la suppression:</label>
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
            <p>Erreur lors de la récupération des données utilisateur.</p>
          )}
        </>
      ) : (
        <p>
          Veuillez-vous connecter à votre compte <Link href="/auth">ici</Link>
        </p>
      )}
    </>
  );
}
