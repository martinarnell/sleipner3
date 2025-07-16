import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { mabryPro } from '@/lib/fonts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Sleipner.ai - LLM Power at a Fraction of the Price',
    template: '%s | Sleipner.ai'
  },
  description: 'Smart AI routing that slashes your large-language-model spend by up to 75% while protecting quality. Zero refactor needed - just swap your base URL.',
  keywords: [
    'AI API',
    'LLM routing',
    'cost reduction',
    'GPT-4 alternative',
    'OpenAI API',
    'AI cost optimization',
    'intelligent routing',
    'enterprise AI',
    'model switching',
    'AI savings'
  ],
  authors: [{ name: 'Sleipner.ai' }],
  creator: 'Sleipner.ai',
  publisher: 'Sleipner.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sleipner.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sleipner.ai',
    title: 'Sleipner.ai - LLM Power at a Fraction of the Price',
    description: 'Smart AI routing that slashes your large-language-model spend by up to 75% while protecting quality. Zero refactor needed - just swap your base URL.',
    siteName: 'Sleipner.ai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sleipner.ai - Smart AI Routing for Cost-Effective LLM Usage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sleipner.ai - LLM Power at a Fraction of the Price',
    description: 'Smart AI routing that slashes your large-language-model spend by up to 75% while protecting quality. Zero refactor needed - just swap your base URL.',
    images: ['/og-image.png'],
    creator: '@sleipner_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={mabryPro.variable} suppressHydrationWarning>
      <body className={mabryPro.className}>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="sleipner-ui-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
} 