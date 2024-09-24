import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signOut } from "next-auth/react";

// Utiliser un seuil avant expiration pour forcer le rafraîchissement un peu avant l'expiration réelle
const TOKEN_EXPIRATION_THRESHOLD = 15 * 60 * 1000; // 15 minutes avant expiration

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/signin`, {
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
            accessTokenExpires: Date.now() + 30 * 60 * 1000, // Expiration dans 30 minutes
          };
        }

        return null; // En cas d'erreur d'authentification
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
      const refreshedToken = await refreshAccessToken(token);

      if (refreshedToken.error) {
        // Déconnecter l'utilisateur si le rafraîchissement échoue
        console.error("Échec du rafraîchissement du token, déconnexion.");
        await signOut({ redirect: false });
      }

      return refreshedToken;
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
    maxAge: 30 * 60, // La session expire après 15 minutes (équivalent à la durée du token d'accès)
    updateAge: 10 * 60, // Mettre à jour la session toutes les 5 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// Fonction pour rafraîchir le token d'accès
async function refreshAccessToken(token) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!response.ok) {
      console.error("Erreur lors du rafraîchissement du token. Status : ", response.statusText);
      throw new Error('Échec du rafraîchissement du token');
    }

    const refreshedTokens = await response.json();

    // Retourne le nouveau token et réinitialise l'expiration
    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken, // Conserve le refreshToken s'il n'est pas renouvelé
      accessTokenExpires: Date.now() + 30 * 60 * 1000, // 30 minutes supplémentaires
    };
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token :", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export { handler as GET, handler as POST };
