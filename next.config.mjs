/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3003",
        pathname: "/images/**",
      },
      {
        protocol: "https", // Utilise HTTPS pour la production
        hostname: "cgt-tp.fr",
        pathname: "/images/**", // Autorise les images dans ce chemin
      },
    ],
  },

  experimental: {
    metadata: {
      icons: {
        icon: "/favicon.ico",
      },
    },
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
