/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // 1. Diz ao Next para não tentar processar o Genkit no navegador
  serverExternalPackages: ['genkit', '@genkit-ai/google-genai', '@opentelemetry/api'],

  // 2. Configuração do Webpack para ignorar módulos de servidor no cliente
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
        async_hooks: false, // Aqui morre o erro 'Can't resolve async_hooks'
      };
    }
    return config;
  },
};

export default nextConfig;
