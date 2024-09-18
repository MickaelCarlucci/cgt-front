/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',  // Ou 'https' si vous utilisez https en production
          hostname: 'localhost',
          port: '3003',  // Spécifiez le port si nécessaire
          pathname: '/images/**',  // Autorise les images dans ce chemin
        },
      ],
    },
  };
  
  export default nextConfig;