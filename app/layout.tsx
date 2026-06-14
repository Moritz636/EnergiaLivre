import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { getSiteUrl } from '@/lib/env'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = getSiteUrl()
const SITE_NAME = 'EnergiaLivre'
const SITE_DESCRIPTION =
  'Conectamos quem gera energia solar excedente com quem quer economizar na conta de luz. Marketplace de energia solar por assinatura.'
const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Marketplace de Energia Solar`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'energia solar',
    'economia de energia',
    'usina solar',
    'assinatura de energia',
    'energia renovável',
    'marketplace solar',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Marketplace de Energia Solar`,
    description: SITE_DESCRIPTION,
    images: [
      { url: SITE_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Marketplace de Energia Solar`,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://eahwyotzbskfjvsoqzw.supabase.co" />
        <link rel="preconnect" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://eahwyotzbskfjvsoqzw.supabase.co" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
