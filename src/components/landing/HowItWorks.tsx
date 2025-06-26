'use client';

import { motion } from 'framer-motion';

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
    <section className="py-20 bg-background/80">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">How It Works</h2>
          <p className="text-muted-foreground text-lg mt-2">
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
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-background">
                    {step.step}
                  </div>
                  <h3 className="text-3xl font-bold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </div>
              <div className={`hidden md:block ${i % 2 !== 0 ? 'md:order-1' : ''}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 