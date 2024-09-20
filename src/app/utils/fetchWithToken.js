import { getSession, signOut } from "next-auth/react";

export const fetchWithToken = async (url, options = {}) => {
  const session = await getSession();

  if (!session) {
    throw new Error("Session non disponible, veuillez vous reconnecter.");
  }

  const { accessToken, refreshToken } = session;
  const now = Date.now();
  const tokenExpiration = new Date(session.expires).getTime();

  // Vérification si le token est proche de l'expiration
  if (now >= tokenExpiration - 60000) { // Moins de 1 minute avant expiration
    try {
      const response = await fetch("/api/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Erreur lors du rafraîchissement du token.");
      }

      session.accessToken = data.accessToken; // Mise à jour du token
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token :", error);
      await signOut({ redirect: false });
      return;
    }
  }

  // Ajouter le token d'accès aux en-têtes de la requête
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.accessToken}`,
  };

  return fetch(url, { ...options, headers });
};
