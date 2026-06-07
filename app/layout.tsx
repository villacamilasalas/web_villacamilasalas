import type { Metadata, Viewport } from 'next'
import { Inter, Great_Vibes, Montserrat } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
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

export const metadata: Metadata = {
  title: 'Villa Camila Apartamentos | Tu refugio en Asturias',
  description: 'Descubre Villa Camila Apartamentos en Salas, Asturias. Alojamientos rurales con encanto en el corazón del occidente asturiano. WiFi, cocina completa y la tranquilidad de la naturaleza.',
  keywords: ['apartamentos rurales', 'Asturias', 'Salas', 'alojamiento rural', 'turismo rural', 'Villa Camila'],
  authors: [{ name: 'Villa Camila Apartamentos' }],
  openGraph: {
    title: 'Villa Camila Apartamentos | Tu refugio en Asturias',
    description: 'Alojamientos rurales con encanto en el corazón del occidente asturiano.',
    type: 'website',
    locale: 'es_ES',
  },
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
