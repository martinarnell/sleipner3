import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { mabryPro } from '@/lib/fonts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Slash Your LLM Bill up to 75 % | Sleipner.ai',
    template: '%s | Sleipner.ai'
  },
  description: 'Sleipner.ai routes, caches & compresses every LLM request—saving teams up to 75 % on GPT-4, Claude & Gemini costs with zero code refactor.',
  keywords: [
    'LLM cost optimisation',
    'AI gateway',
    'model routing',
    'semantic cache',
    'prompt compression',
    'OpenAI router',
    'GPT-4 cost reduction',
    'Claude savings',
    'enterprise AI FinOps'
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
    canonical: 'https://sleipner.ai/',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sleipner.ai',
    title: 'Slash Your LLM Bill up to 75 % | Sleipner.ai',
    description: 'Sleipner.ai routes, caches & compresses every LLM request—saving teams up to 75 % on GPT-4, Claude & Gemini costs with zero code refactor.',
    siteName: 'Sleipner.ai',
    images: [
      {
        url: 'https://sleipner.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sleipner.ai - Smart AI Routing for Cost-Effective LLM Usage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slash Your LLM Bill up to 75 % | Sleipner.ai',
    description: 'Sleipner.ai routes, caches & compresses every LLM request—saving teams up to 75 % on GPT-4, Claude & Gemini costs with zero code refactor.',
    images: ['https://sleipner.ai/og-image.png'],
    creator: '@sleipner_ai',
    site: '@sleipner_ai',
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Sleipner.ai",
    "alternateName": "Sleipner AI Gateway",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "SaaSApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "name": "Performance-Based Pricing",
      "description": "25 % of realised LLM cost savings; zero fee if no savings",
      "price": "0",
      "priceCurrency": "EUR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "0",
        "priceCurrency": "EUR",
        "priceUnit": "per-month until savings realised"
      },
      "availability": "https://schema.org/InStock",
      "url": "https://sleipner.ai#pricing",
      "category": "BetaFreeTrialOffer"
    },
    "description": "Swap one API URL and cut large-language-model spend up to 75 % with Sleipner's AI router, semantic cache and prompt compression.",
    "applicationSuite": "LLM Cost Optimisation Platform",
    "screenshot": "https://sleipner.ai/og-image.png",
    "featureList": [
      "Dynamic LLM tier routing",
      "Semantic prompt cache",
      "Lossless prompt compression",
      "Automatic quality judge & fallback",
      "Pay-as-you-save billing"
    ],
    "provider": {
      "@type": "Organization",
      "name": "Sleipner.ai",
      "url": "https://sleipner.ai",
      "sameAs": [
        "https://x.com/sleipner_ai",
        "https://www.linkedin.com/company/sleipner-ai",
        "https://github.com/sleipner-ai"
      ]
    }
  }

  return (
    <html lang="en" className={`${mabryPro.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={mabryPro.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
} 