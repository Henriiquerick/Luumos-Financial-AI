import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* --- Configurações Existentes --- */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
