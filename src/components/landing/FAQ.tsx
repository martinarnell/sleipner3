import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
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
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg mt-2">
            Have questions? We&apos;ve got answers.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
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