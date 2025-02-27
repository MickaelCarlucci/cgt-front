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
        protocol: "https",
        hostname: "cgt-tp.fr",
        pathname: "/images/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://88.223.95.21/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
