import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { AnimateOnScroll } from "@/components/landing/AnimateOnScroll";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Sleipner.ai",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "AI API Gateway",
    "operatingSystem": "Web",
    "description": "Smart AI routing that slashes your large-language-model spend by up to 75% while protecting quality. Zero refactor needed - just swap your base URL.",
    "url": "https://sleipner.ai",
    "provider": {
      "@type": "Organization",
      "name": "Sleipner.ai"
    },
    "offers": {
      "@type": "Offer",
      "description": "AI API routing service with up to 75% cost reduction"
    },
    "featureList": [
      "Dynamic Tiered Routing",
      "Automated Quality Assurance", 
      "Cost Reduction up to 75%",
      "Zero Refactor Integration",
      "Enterprise-Grade Governance"
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main>
        <Hero />
        <AnimateOnScroll>
          <TrustedBy />
        </AnimateOnScroll>
        <AnimateOnScroll>
          <Features />
        </AnimateOnScroll>
        <HowItWorks />
        <AnimateOnScroll>
          <Testimonials />
        </AnimateOnScroll>
        <AnimateOnScroll>
          <Pricing />
        </AnimateOnScroll>
        <AnimateOnScroll>
          <FAQ />
        </AnimateOnScroll>
        <AnimateOnScroll>
          <CTA />
        </AnimateOnScroll>
      </main>
      <Footer />
    </>
  )
} 