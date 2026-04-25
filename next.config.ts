
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configura o Next.js para gerar apenas arquivos estáticos (HTML/CSS/JS)
  // Essencial para empacotamento com Capacitor/Cordova
  // output: 'export',
  
  // Otimização de imagem nativa do Next.js requer um servidor Node.js rodando.
  // No modo 'export', precisamos desativar ou usar um loader externo.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'img.icons8.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // CORREÇÃO PARA AMBIENTE FIREBASE STUDIO / CLOUD WORKSTATIONS
  // Permite que o Next.js aceite requisições do proxy do ambiente de desenvolvimento
  experimental: {
    allowedDevOrigins: [
      '*.cloudworkstations.dev',
      'localhost:9002'
    ]
  },
  async headers() {
    return [
      {
        // Aplica essas regras de liberação para TODAS as rotas dentro de /api
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // O asterisco (*) libera o acesso para qualquer origem, incluindo o 'https://localhost' do celular
          { key: "Access-Control-Allow-Origin", value: "*" }, 
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ];
  },
};

export default nextConfig;
