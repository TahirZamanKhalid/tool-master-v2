import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface ToolFAQProps {
  toolName: string;
  customFAQs?: FAQ[];
}

export const ToolFAQ = ({ toolName, customFAQs = [] }: ToolFAQProps) => {
  // Default FAQs that apply to all tools
  const defaultFAQs: FAQ[] = [
    {
      question: `Is the ${toolName} free to use?`,
      answer: `Yes, the ${toolName} is completely free to use with no hidden costs or subscriptions. All features are available at no charge.`,
    },
    {
      question: `Do I need to sign up to use this tool?`,
      answer: `No, you can use the ${toolName} without any registration or sign-up. Simply access the tool and start using it immediately.`,
    },
    {
      question: `Is my data safe? Do you store my files?`,
      answer: `Your privacy is our priority. All processing happens in your browser (client-side), and we do not upload or store any of your files on our servers. Your data never leaves your device.`,
    },
    {
      question: `Can I use this tool on mobile devices?`,
      answer: `Yes, the ${toolName} is fully responsive and works on all devices including smartphones, tablets, and desktop computers.`,
    },
    {
      question: `Are there any file size or usage limits?`,
      answer: `The ${toolName} processes files directly in your browser, so limits depend on your device's capabilities. Most modern devices can handle typical file sizes without issues.`,
    },
  ];

  // Combine custom and default FAQs
  const allFAQs = [...customFAQs, ...defaultFAQs];

  // Generate FAQ schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFAQs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <>
      {/* FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* FAQ UI */}
      <div className="bg-muted/30 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {allFAQs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
};
