import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/sesiones",
        destination: "/experiencias-individuales",
        permanent: true,
      },
      {
        source: "/carta-numerologica",
        destination: "/experiencias-individuales",
        permanent: true,
      },
      {
        source: "/ciclo-solar",
        destination: "/experiencias-individuales",
        permanent: true,
      },
      {
        source: "/registros-akashicos",
        destination: "/experiencias-individuales",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
