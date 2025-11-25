import { useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOSchemaProps {
  type?: 'WebSite' | 'SoftwareApplication' | 'FAQPage';
  name?: string;
  description?: string;
  url?: string;
  faqs?: FAQItem[];
}

export const SEOSchema = ({ 
  type = 'WebSite', 
  name = 'ToolMaster Pro',
  description = 'Free online tools for developers, designers, and content creators',
  url,
  faqs
}: SEOSchemaProps) => {
  useEffect(() => {
    // Remove existing schema if any
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': type,
      name,
      description,
    };

    if (url) {
      schema.url = url;
    }

    if (type === 'SoftwareApplication') {
      schema.applicationCategory = 'UtilitiesApplication';
      schema.offers = {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      };
    }

    if (type === 'FAQPage' && faqs && faqs.length > 0) {
      schema.mainEntity = faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }));
    }

    // Add the new schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [type, name, description, url, faqs]);

  return null;
};
