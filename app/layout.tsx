import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Poppins, Inter } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ASPAN | Associação Promocional do Ancião',
  description:
    'A ASPAN cuida com amor e dignidade de idosos, oferecendo atendimento multiprofissional, atividades e convívio de qualidade. Ajude, doe e faça toda a diferença.',
  generator: 'v0.app',
  icons: {
    icon: '/images/aspan-logo.webp',
    shortcut: '/images/aspan-logo.webp',
    apple: '/images/aspan-logo.webp',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-background font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
