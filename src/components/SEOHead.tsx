import { Helmet } from "react-helmet-async";

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
  const finalTitle = title === "ToolMaster Pro" ? title : `${title} | ToolMaster Pro`;
  const truncatedTitle = finalTitle.substring(0, 60);
  const truncatedDesc = description.substring(0, 160);

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{truncatedTitle}</title>
      <meta name="description" content={truncatedDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph tags for Facebook, LinkedIn, etc. */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="ToolMaster Pro" />
      <meta property="og:locale" content="en_US" />
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card tags for enhanced Twitter sharing */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ToolMasterPro" />
      <meta name="twitter:creator" content="@ToolMasterPro" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Additional meta tags for better indexing */}
      <meta name="theme-color" content="#1a1a2e" />
      <meta name="msapplication-TileColor" content="#1a1a2e" />
    </Helmet>
  );
};
