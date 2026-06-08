import type { Metadata, Viewport } from 'next'
import { Inter, Great_Vibes, Montserrat } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { GoogleAnalytics } from '@/components/google-analytics'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
})

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: '--font-great-vibes',
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: '--font-montserrat',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://villacamilasalas.es'

export const metadata: Metadata = {
  title: 'Villa Camila Salas Apartamentos | Turismo Rural en Asturias',
  description: 'Descubre Villa Camila Salas Apartamentos en Asturias. Alojamientos rurales con encanto en el occidente asturiano. WiFi, cocina completa y naturaleza.',
  keywords: ['apartamentos rurales', 'Asturias', 'Salas', 'alojamiento rural', 'turismo rural', 'Villa Camila', 'Apartamentos Asturias', 'villa asturias'],
  authors: [{ name: 'Villa Camila Salas Apartamentos' }],
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  appleWebApp: {
    title: 'villacamilasalas',
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Villa Camila Salas Apartamentos | Turismo Rural en Asturias',
    description: 'Descubre Villa Camila Salas Apartamentos en Asturias. Alojamientos rurales con encanto en el occidente asturiano. WiFi, cocina completa y naturaleza.',
    url: siteUrl,
    type: 'website',
    locale: 'es_ES',
    siteName: 'Villa Camila Salas Apartamentos',
    images: [
      {
        url: '/Exteriores/VC - Ext_006.webp',
        width: 1200,
        height: 630,
        alt: 'Villa Camila Salas Apartamentos — Turismo Rural en Asturias',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Villa Camila Salas Apartamentos | Turismo Rural en Asturias',
    description: 'Descubre Villa Camila Salas Apartamentos en Asturias. Alojamientos rurales con encanto en el occidente asturiano. WiFi, cocina completa y naturaleza.',
    images: ['/Exteriores/VC - Ext_006.webp'],
  },
  metadataBase: new URL(siteUrl),
}

export const viewport: Viewport = {
  themeColor: '#1a2e1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${greatVibes.variable} ${montserrat.variable} bg-background`} suppressHydrationWarning>
        <body className="font-sans antialiased overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              "name": "Villa Camila Salas Apartamentos",
              "image": `${siteUrl}/logo.webp`,
              "url": siteUrl,
              "telephone": "+34689575612",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Villaraba, 22",
                "addressLocality": "Villazón, Salas",
                "postalCode": "33860",
                "addressRegion": "Asturias",
                "addressCountry": "ES",
              },
              "sameAs": [
                "https://maps.app.goo.gl/E7Ef3ogbDJPBp7R79",
              ],
            }),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <GoogleAnalytics />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
