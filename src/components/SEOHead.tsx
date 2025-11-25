import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  author?: string;
  type?: "website" | "article" | "product";
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords,
  ogImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/social-images/social-1759510890634-toolmasterpro logo.jpeg",
  canonical,
  author = "ToolMaster Pro",
  type = "website"
}: SEOHeadProps) => {
  useEffect(() => {
    // Set title - limit to 60 characters for SEO, show just the title for homepage
    const finalTitle = title === "ToolMaster Pro" ? title : `${title} | ToolMaster Pro`;
    document.title = finalTitle.substring(0, 60);

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
    updateMetaTag("description", description.substring(0, 160), true);
    if (keywords) {
      updateMetaTag("keywords", keywords, true);
    }
    updateMetaTag("author", author, true);
    updateMetaTag("robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1", true);
    updateMetaTag("viewport", "width=device-width, initial-scale=1.0", true);

    // Open Graph tags for Facebook, LinkedIn, etc.
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description.substring(0, 160));
    updateMetaTag("og:image", ogImage);
    updateMetaTag("og:image:width", "1200");
    updateMetaTag("og:image:height", "630");
    updateMetaTag("og:image:alt", title);
    updateMetaTag("og:type", type);
    updateMetaTag("og:site_name", "ToolMaster Pro");
    updateMetaTag("og:locale", "en_US");
    if (canonical) {
      updateMetaTag("og:url", canonical);
    }

    // Twitter Card tags for enhanced Twitter sharing
    updateMetaTag("twitter:card", "summary_large_image", true);
    updateMetaTag("twitter:site", "@ToolMasterPro", true);
    updateMetaTag("twitter:creator", "@ToolMasterPro", true);
    updateMetaTag("twitter:title", title, true);
    updateMetaTag("twitter:description", description.substring(0, 160), true);
    updateMetaTag("twitter:image", ogImage, true);
    updateMetaTag("twitter:image:alt", title, true);

    // Additional meta tags for better indexing
    updateMetaTag("theme-color", "#1a1a2e", true);
    updateMetaTag("msapplication-TileColor", "#1a1a2e", true);

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
  }, [title, description, keywords, ogImage, canonical, author, type]);

  return null;
};
