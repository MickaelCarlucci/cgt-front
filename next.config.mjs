 const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3003',
        pathname: '/images/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Appliquer les headers de cache pour toutes les ressources
        source: '/(.*)', 
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // Permet un caching long
          },
        ],
      },
      {
        // Headers spécifiques pour les images (si besoin)
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // Caching pour les images (1 jour)
          },
        ],
      },
    ];
  },
};

export default nextConfig;
