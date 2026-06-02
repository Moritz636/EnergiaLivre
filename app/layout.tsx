import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'EnergiaLivre | Domine Sua Conta de Luz',
    template: '%s | EnergiaLivre'
  },
  description: 'A liberdade energética que você merece. Conectamos quem gera energia solar com quem quer lucrar e economizar de forma inteligente.',
  keywords: ['energia solar por assinatura', 'mercado livre de energia', 'economia na conta de luz'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}