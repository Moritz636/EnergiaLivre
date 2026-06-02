import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Fonte Inter: transmite clareza, modernidade e autoridade institucional
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Lei 28: Ousadia - viewport otimizado para experiência premium
export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Lei 6: Domine os títulos - cada página é uma promessa
export const metadata: Metadata = {
  title: {
    default: 'EnergiaLivre | Domine Sua Conta de Luz',
    template: '%s | EnergiaLivre'
  },
  description: 'A liberdade energética que você merece. Conectamos quem gera energia solar com quem quer lucrar e economizar de forma inteligente.',
  keywords: ['energia solar por assinatura', 'mercado livre de energia', 'economia na conta de luz', 'EnergiaLivre'],
  authors: [{ name: 'EnergiaLivre', url: 'https://energia-livre.vercel.app' }],
  creator: 'EnergiaLivre',
  publisher: 'EnergiaLivre',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://energia-livre.vercel.app',
    siteName: 'EnergiaLivre',
    title: 'EnergiaLivre | Domine Sua Conta de Luz',
    description: 'Pare de alugar energia. Comece a dominar sua conta de luz.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EnergiaLivre | Domine Sua Conta de Luz',
    description: 'Pare de alugar energia. Comece a dominar sua conta de luz.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" className="scroll-smooth">
        <body className={`${inter.className} ${inter.variable} bg-slate-950 text-slate-200 antialiased min-h-screen flex flex-col`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}