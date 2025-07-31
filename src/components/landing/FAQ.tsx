import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: 'What if Sleipner doesn\'t save us money?',
    answer: 'You pay nothing; no hidden charges.',
  },
  {
    question: 'Is it a drop-in replacement for the OpenAI API?',
    answer: 'Yes—just change the base URL. No code refactor required.',
  },
  {
    question: 'How does Sleipner handle my provider key?',
    answer: 'Forwarded once per request over TLS. Ephemeral by default (not persisted). Optionally stored encrypted if you enable key vault.',
  },
  {
    question: 'Which models do you support?',
    answer: 'GPT-3.5 / 4o, Claude 3 series, Gemini 1.5, Llama 3, Mixtral, and more.',
  },
  {
    question: 'Can I set a maximum cost or tier?',
    answer: 'Absolutely—define hard caps or force premium for specific routes.',
  },
  {
    question: 'How do you ensure quality?',
    answer: 'Every response is graded by independent judge models; anything < 90/100 is auto-retried with a stronger model.',
  },
]

export const FAQ = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Have questions? We&apos;ve got answers.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`} 
                className="bg-background/80 backdrop-blur-sm border border-primary/10 rounded-lg px-4 sm:px-6 py-2"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
} 