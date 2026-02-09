import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  // Generate breadcrumb schema markup for SEO
  const generateSchema = () => {
    const itemListElement = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://toolmaster.cloud"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        // Always provide a valid URL - use current page URL if no path specified
        "item": item.path
          ? `https://toolmaster.cloud${item.path}`
          : (typeof window !== 'undefined' ? window.location.href : "https://toolmaster.cloud")
      }))
    ];

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": itemListElement
    };
  };

  return (
    <>
      {/* Schema.org structured data for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
      />

      {/* Visual breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol
          className="flex items-center gap-2 text-sm text-muted-foreground"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          <li
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              to="/"
              className="hover:text-foreground transition-colors flex items-center gap-1"
              itemProp="item"
            >
              <Home className="h-4 w-4" />
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              {item.path && index !== items.length - 1 ? (
                <>
                  <Link
                    to={item.path}
                    className="hover:text-foreground transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                  <meta itemProp="position" content={String(index + 2)} />
                </>
              ) : (
                <>
                  <span
                    className="text-foreground font-medium"
                    itemProp="item"
                    itemScope
                    itemType="https://schema.org/WebPage"
                  >
                    <span itemProp="name">{item.label}</span>
                  </span>
                  <meta itemProp="position" content={String(index + 2)} />
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};
