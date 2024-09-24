import { getSession, signOut } from "next-auth/react";

export const fetchWithToken = async (url, options = {}) => {
  const session = await getSession();

  if (!session) {
    console.error("Session non disponible, déconnexion en cours.");
    await signOut({ redirect: false }); // Déconnexion immédiate si la session est perdue
    return;
  }

  const { accessToken, refreshToken } = session;
  const now = Date.now();
  const tokenExpiration = new Date(session.expires).getTime();

  // Si le token a déjà expiré
  if (now >= tokenExpiration) {
    try {
      console.log("Token expiré, tentative de rafraîchissement du token.");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error("Erreur lors du rafraîchissement du token :", response.statusText);
        throw new Error("Erreur lors du rafraîchissement du token.");
      }

      const data = await response.json();
      console.log("Rafraîchissement du token réussi, nouveaux tokens :", data);

      // Mise à jour des tokens dans la session après le rafraîchissement
      session.accessToken = data.accessToken;
      session.refreshToken = data.refreshToken ?? refreshToken; // Utilise le nouveau refreshToken s'il est disponible
      session.expires = Date.now() + 30 * 60 * 1000; // Recalcule l'expiration pour 15 minutes

    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token :", error);
      await signOut({ redirect: false }); // Déconnexion immédiate en cas d'erreur de rafraîchissement
      return;
    }
  }

  // Ajouter le token d'accès aux en-têtes de la requête si valide ou après rafraîchissement
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.accessToken}`,
  };

  // Effectuer la requête API avec le token valide ou rafraîchi
  return fetch(url, { ...options, headers });
};
