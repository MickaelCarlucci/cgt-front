import { auth } from "../../../firebase-config"; // Assurez-vous que Firebase est correctement configuré

export const fetchWithToken = async (url, options = {}) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error("Aucun utilisateur connecté.");
    return;
  }

  // Récupérer le token d'accès Firebase (ID Token)
  try {
    const idToken = await currentUser.getIdToken(true); // true pour forcer la récupération d'un nouveau token si nécessaire

    // Ajouter le token d'accès dans l'en-tête Authorization
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${idToken}`,
    };

    // Faire la requête API avec le token valide
    return fetch(url, { ...options, headers });
  } catch (error) {
    console.error("Erreur lors de la récupération du token Firebase:", error);
    return;
  }
};
