
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* --- Configurações Existentes --- */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.icons8.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  /* --- Correção para Firebase Auth (Popup Closed by User) --- */
  async headers() {
    return [
      {
        // Aplica esses headers em todas as rotas
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
