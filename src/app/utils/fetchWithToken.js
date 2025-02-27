import { firebaseAuth } from "../../../firebaseConfig";

export const fetchWithToken = async (url, options = {}) => {
  const currentUser = firebaseAuth.currentUser;

  if (!currentUser) {
    console.error("Aucun utilisateur connecté.");
    return;
  }

  try {
    const idToken = await currentUser.getIdToken(true);

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${idToken}`,
    };

    return fetch(url, { ...options, headers });
  } catch (error) {
    console.error("Erreur lors de la récupération du token Firebase:", error);
    return;
  }
};
