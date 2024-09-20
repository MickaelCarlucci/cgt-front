import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signOut } from "next-auth/react";

// Utiliser un seuil avant expiration pour forcer le rafraîchissement un peu avant l'expiration réelle
const TOKEN_EXPIRATION_THRESHOLD = 60 * 1000; // 1 minute avant expiration

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:3003/api/users/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mail: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await res.json();

        if (res.ok && data.accessToken) {
          return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            id: data.user.id,
            pseudo: data.user.pseudo,
            center_id: data.user.center_id,
            roles: data.user.roles,
            accessTokenExpires: Date.now() + 15 * 60 * 1000, // Expiration dans 15 minutes
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now();

      // Si c'est la première connexion
      if (user) {
        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          id: user.id,
          pseudo: user.pseudo,
          center_id: user.center_id,
          roles: user.roles,
        };
      }

      // Si le token est encore valide, on le renvoie tel quel
      if (now < token.accessTokenExpires - TOKEN_EXPIRATION_THRESHOLD) {
        return token;
      }

      // Si le token a expiré, on essaie de le rafraîchir
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      // Ajouter les tokens et informations utilisateurs dans la session
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = {
        id: token.id,
        pseudo: token.pseudo,
        center_id: token.center_id,
        roles: token.roles
      };

      // Gérer une potentielle erreur de rafraîchissement
      if (token.error) {
        session.error = token.error;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt', // Utiliser le JWT pour gérer les sessions
    maxAge: 15 * 60, // La session expire après 15 minutes (équivalent à la durée du token d'accès)
    updateAge: 5 * 60, // Rafraîchir la session toutes les 5 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// Fonction pour rafraîchir le token d'accès
async function refreshAccessToken(token) {
  try {
    // Appel à l'API pour rafraîchir le token
    const response = await fetch("http://localhost:3003/api/users/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Échec du rafraîchissement du token');
    }

    const refreshedTokens = await response.json();

    // Retourne le nouveau token et réinitialise l'expiration
    return {
      ...token, // Conserve les données actuelles comme le refreshToken
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes supplémentaires
    };
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token :", error);

    // En cas d'erreur, on déconnecte l'utilisateur
    await signOut({ callbackUrl: '/auth' });

    return {
      ...token,
      error: "RefreshAccessTokenError", // Garde une trace de l'erreur
    };
  }
}

export { handler as GET, handler as POST };
