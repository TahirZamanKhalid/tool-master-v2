import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords,
  ogImage = "/placeholder.svg",
  canonical
}: SEOHeadProps) => {
  useEffect(() => {
    // Set title - show just the title for homepage, add suffix for other pages
    document.title = title === "ToolMaster Pro" ? title : `${title} | ToolMaster Pro`;

    // Set or update meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let tag = document.querySelector(selector);
      
      if (!tag) {
        tag = document.createElement("meta");
        if (isName) {
          tag.setAttribute("name", property);
        } else {
          tag.setAttribute("property", property);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", description, true);
    if (keywords) {
      updateMetaTag("keywords", keywords, true);
    }

    // Open Graph tags
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description);
    updateMetaTag("og:image", ogImage);
    updateMetaTag("og:type", "website");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image", true);
    updateMetaTag("twitter:title", title, true);
    updateMetaTag("twitter:description", description, true);
    updateMetaTag("twitter:image", ogImage, true);

    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }
  }, [title, description, keywords, ogImage, canonical]);

  return null;
};
