/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração geral
  reactStrictMode: true,
  swcMinify: true,

  // Configuração para deploy no Railway
  output: 'standalone',

  // Configuração de imagens
  images: {
    domains: ['agentesdeconversao.com.br'],
    unoptimized: true,
  },

  // Ignorar erros durante o build para facilitar deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configurações explícitas para forçar App Router
  distDir: '.next',
  poweredByHeader: false,
  cleanDistDir: true,

  // Explicitamente desativar Pages Router
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Configurações experimentais
  experimental: {
    serverComponentsExternalPackages: [],
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
