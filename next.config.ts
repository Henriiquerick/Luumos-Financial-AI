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
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
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

  /* --- Blindagem para erros de 'async_hooks' e módulos do Node --- */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        async_hooks: false, // O culpado principal
      };
    }
    return config;
  },

  /* --- Opcional: Ajuda a evitar erros de pacotes ESM --- */
  experimental: {
    serverComponentsExternalPackages: ['genkit', '@genkit-ai/google-genai'],
  },
};

export default nextConfig;
