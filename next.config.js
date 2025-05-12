/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['agentesdeconversao.com.br'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Explicitamente define o diretório da aplicação
  distDir: '.next', // Forçar o diretório de output
  poweredByHeader: false, // Remove o cabeçalho X-Powered-By por segurança
  cleanDistDir: true, // Limpa o diretório de destino antes de compilar
}

module.exports = nextConfig