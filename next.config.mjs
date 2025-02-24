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
};

export default nextConfig;
