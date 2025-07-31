import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: 'What if Sleipner doesn&apos;t save us money?',
    answer: 'You pay nothing. Our pricing is 100% performance-based—if we don\'t deliver savings, we don\'t get paid.',
  },
  {
    question: 'Is this a drop-in replacement for the OpenAI API?',
    answer: 'Yes. You only need to change the base URL to our proxy endpoint and add your API key. Your existing code will work without any other changes.',
  },
  {
    question: 'What models do you support?',
    answer: 'We support a wide range of models from providers like OpenAI, Anthropic, Google, and open-source alternatives. Our routing system automatically selects the best model for each query based on cost and quality.',
  },
  {
    question: 'Can I set a maximum cost or model tier?',
    answer: 'Absolutely. You have full control to set spending limits and define the maximum model tier (e.g., never escalate beyond GPT-4o) to prevent unexpected costs.',
  },
  {
    question: 'How do you ensure quality?',
    answer: 'We use a proprietary grading system with independent "judge" models to score every response for accuracy and helpfulness. You can also enable optional self-correction mechanisms for tasks like code generation.',
  },
]

export const FAQ = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background/50 to-background">
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