
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configura o Next.js para gerar apenas arquivos estáticos (HTML/CSS/JS)
  // Essencial para empacotamento com Capacitor/Cordova
  output: 'export',
  
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
  }
};

export default nextConfig;
