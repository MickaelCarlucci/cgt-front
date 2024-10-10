import withPWA from 'next-pwa';

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
  
};

export default withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
}, nextConfig); 