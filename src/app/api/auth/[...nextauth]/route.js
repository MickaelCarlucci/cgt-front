// src/pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";



// Utiliser un délai un peu plus long pour s'assurer qu'on régénère avant l'expiration
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
          // Ensure the user object contains the necessary properties
          return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            id: data.user.id,
            pseudo: data.user.pseudo,
            center_id: data.user.center_id,
            roles: data.user.roles,
            accessTokenExpires: Date.now() + 15 * 60 * 1000, // Access token expiration time (15 minutes)
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        return {
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          id: user.id,
          pseudo: user.pseudo,
          center_id: user.center_id,
          roles: user.roles
        };
      }

      // Vérifie si le token a expiré
      const now = Date.now();
      if (now < token.accessTokenExpires - TOKEN_EXPIRATION_THRESHOLD) {
        // Token is still valid, return it
        return token;
      }

      // Token has expired, try to refresh it
      try {
        const refreshedTokens = await refreshAccessToken(token.refreshToken);
        return {
          ...token,
          accessToken: refreshedTokens.accessToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // Reset the expiration
        };
      } catch (error) {
        console.error("Error refreshing access token", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      // Ajouter les tokens dans la session
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
  secret: process.env.NEXTAUTH_SECRET,
});

// Fonction pour rafraîchir le token d'accès
async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch("http://localhost:3003/api/users/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      accessToken: refreshedTokens.accessToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    throw error;
  }
}

export { handler as GET, handler as POST };
