// Estilos aplicados explicitamente na ordem correta para evitar problemas
import '../styles/globals.css'
import '../styles/output.css'

// Importações de tipos do Next.js
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Agentes de Conversão | Plataforma',
  description: 'Explore recursos, tutoriais, documentação de API e exemplos dinâmicos para aproveitar ao máximo a plataforma de inteligência artificial Agentes de Conversão.',
  metadataBase: new URL('https://agentesdeconversao.com.br'),
  openGraph: {
    title: 'Agentes de Conversão | Plataforma',
    description: 'Explore recursos para desenvolvedores, tutoriais, documentação de API e exemplos dinâmicos para aproveitar ao máximo nossa plataforma.',
    images: [
      {
        url: '/images/platform-opengraph.png',
        width: 1200,
        height: 630,
        alt: 'Agentes de Conversão Platform',
      },
    ],
    url: 'https://agentesdeconversao.com.br',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agentes de Conversão | Plataforma',
    description: 'Explore recursos para desenvolvedores, tutoriais, documentação de API e exemplos dinâmicos para aproveitar ao máximo nossa plataforma.',
    images: ['/images/platform-opengraph.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon-platform.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon-platform.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/soehne-web-buch.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/soehne-web-halbfett.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/soehne-web-kraftig.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <Suspense fallback={<div>Carregando...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}