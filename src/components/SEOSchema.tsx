// Comprehensive SEO Schema Components for Rich Snippets

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQSchema = ({ faqs }: FAQSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: string[];
  toolUrl: string;
  estimatedTime?: string;
}

export const HowToSchema = ({
  name,
  description,
  steps,
  toolUrl,
  estimatedTime = "PT2M"
}: HowToSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Use ${name}`,
    "description": description,
    "image": "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/social-images/social-1759510890634-toolmasterpro logo.jpeg",
    "totalTime": estimatedTime,
    "tool": {
      "@type": "HowToTool",
      "name": name,
    },
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step,
      "url": `${toolUrl}#step-${index + 1}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface WebApplicationSchemaProps {
  name: string;
  description: string;
  category: string;
  url: string;
  ratingValue?: string;
  ratingCount?: string;
}

export const WebApplicationSchema = ({
  name,
  description,
  category,
  url,
  ratingValue = "4.8",
  ratingCount = "1250"
}: WebApplicationSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": name,
    "description": description,
    "applicationCategory": category,
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "url": url,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolMaster Pro™",
      "url": "https://toolmaster.cloud",
      "logo": {
        "@type": "ImageObject",
        "url": "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg",
      },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "ratingCount": ratingCount,
      "bestRating": "5",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url?: string;
  }>;
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://toolmaster.cloud",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": item.url || undefined,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  ratingValue?: string;
  ratingCount?: string;
}

export const OrganizationSchema = ({
  name = "ToolMaster Pro™",
  url = "https://toolmaster.cloud",
  logo = "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg",
  description = "Access 100+ free AI-powered online tools instantly. No signup required.",
  ratingValue = "4.9",
  ratingCount = "8543"
}: OrganizationSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "alternateName": "TM",
    "legalName": "ToolMaster Pro",
    "url": url,
    "logo": logo,
    "description": description,
    "sameAs": [url],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "ratingCount": ratingCount,
      "bestRating": "5"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export const WebSiteSchema = ({
  name = "ToolMaster Pro™",
  url = "https://toolmaster.cloud",
  description = "100+ free online tools - Background remover, PDF merger, QR generator, image compressor & more. No signup needed."
}: WebSiteSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolMaster Pro™",
      "logo": {
        "@type": "ImageObject",
        "url": "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface BlogPostingSchemaProps {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  authorName: string;
  url: string;
}

export const BlogPostingSchema = ({
  title,
  description,
  image,
  datePublished,
  authorName,
  url,
}: BlogPostingSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": image,
    "datePublished": datePublished,
    "author": {
      "@type": "Organization",
      "name": authorName,
      "url": "https://toolmaster.cloud"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ToolMaster Pro™",
      "logo": {
        "@type": "ImageObject",
        "url": "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/uploads/1759510903222-toolmasterpro logo.jpeg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
