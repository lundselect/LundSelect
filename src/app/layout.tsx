import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Providers from '@/components/Providers'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import CookieConsent from '@/components/ui/CookieConsent'
import BackToTop from '@/components/ui/BackToTop'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Lund Select — Moda Feminina Brasileira',
  description: 'Brasil inteiro. Uma só vitrine. As melhores marcas de moda feminina brasileira em um só lugar.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lund Select',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lundselect.com.br',
    siteName: 'Lund Select',
    title: 'Lund Select — Moda Feminina Brasileira',
    description: 'Brasil inteiro. Uma só vitrine. As melhores marcas de moda feminina brasileira em um só lugar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lund Select — Moda Feminina Brasileira',
    description: 'Brasil inteiro. Uma só vitrine. As melhores marcas de moda feminina brasileira em um só lugar.',
  },
  alternates: {
    canonical: 'https://lundselect.com.br',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#faf8f5',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#faf8f5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Lund Select',
              url: 'https://lundselect.com.br',
              logo: 'https://lundselect.com.br/icons/icon-512x512.png',
              description: 'Brasil inteiro. Uma só vitrine. As melhores marcas de moda feminina brasileira em um só lugar.',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'oi@lundselect.com.br',
                contactType: 'customer service',
                availableLanguage: 'Portuguese',
              },
              sameAs: ['https://instagram.com/lundselect'],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-primary text-offwhite antialiased`}>
        <Providers>
          <a href="#main-content" className="skip-link">Ir para o conteúdo</a>
          <AnnouncementBar />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CookieConsent />
          <BackToTop />
        </Providers>
      </body>
    </html>
  )
}
