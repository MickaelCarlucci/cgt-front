/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http", // Ou 'https' si vous utilisez HTTPS en production
        hostname: "localhost",
        port: "3003", // Spécifiez le port si nécessaire
        pathname: "/images/**", // Autorise les images dans ce chemin
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/uploads/:path*", // Route vers les fichiers PDF
        destination: "http://88.223.95.21/uploads/:path*", // Redirection vers le serveur
      },
    ];
  },
};

export default nextConfig;
