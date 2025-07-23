'use client';

import { motion } from 'framer-motion';
import { Aurora } from '@/components/Aurora';

const steps = [
  {
    step: 1,
    title: 'Swap Your Base URL',
    description: 'Integration is as simple as changing one line of code. Point your existing OpenAI API calls to our endpoint.',
  },
  {
    step: 2,
    title: 'Intelligent Routing Kicks In',
    description: 'Sleipner.ai analyzes each query and routes it to the most efficient model that can deliver a high-quality response.',
  },
  {
    step: 3,
    title: 'Start Saving Instantly',
    description: 'Watch your LLM costs drop by up to 75% without any impact on performance or quality. Monitor your savings from your dashboard.',
  },
];

export const HowItWorks = () => {
  // const lineVariants = {
  //   hidden: { pathLength: 0 },
  //   visible: { pathLength: 1, transition: { duration: 1, ease: "easeInOut" } }
  // };

  return (
    <section className="relative py-24 bg-gradient-to-b from-background/80 to-background overflow-hidden">
      <Aurora variant="minimal" overlay overlayOpacity={2} />
      <div className="relative container mx-auto px-6 z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Start saving in just three simple steps.
          </p>
        </div>
        <div className="relative">
          {/* The connecting line */}
          <div className="hidden md:block absolute top-12 left-1/2 w-[2px] h-[calc(100%-6rem)] -translate-x-1/2 bg-border" />
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="md:grid md:grid-cols-2 md:gap-16 items-center mb-24 relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <div className={`text-center md:text-left ${i % 2 !== 0 ? 'md:order-2' : ''}`}>
                <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
                  <div className="bg-primary text-primary-foreground h-16 w-16 rounded-full flex items-center justify-center font-bold text-2xl border-4 border-background shadow-lg shadow-primary/20">
                    {step.step}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-lg">{step.description}</p>
              </div>
              <div className={`hidden md:block ${i % 2 !== 0 ? 'md:order-1' : ''}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 