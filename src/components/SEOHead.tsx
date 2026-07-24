import { Helmet } from "react-helmet-async";
import { normalizeCanonicalUrl, SITE_URL, toCanonicalUrl } from "@/utils/seo";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  author?: string;
  type?: "website" | "article" | "product";
  /** Breadcrumbs for BreadcrumbList JSON-LD schema */
  breadcrumbs?: BreadcrumbItem[];
  /** Custom JSON-LD schema(s) — e.g., WebApplication, HowTo, SoftwareApplication */
  jsonLd?: object | object[];
  /** Article published date (ISO 8601) */
  publishedTime?: string;
  /** Article modified date (ISO 8601) */
  modifiedTime?: string;
  /** Article tags (for blog posts) */
  articleTags?: string[];
  /** Override the noindex behavior */
  noindex?: boolean;
}

const DEFAULT_OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/yMvNOmZBvnfsQnZifJHbZHWPZ6n1/social-images/social-1759510890634-toolmasterpro logo.jpeg";
export const SEOHead = ({
  title,
  description,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  canonical,
  author = "ToolMaster Pro",
  type = "website",
  breadcrumbs,
  jsonLd,
  publishedTime,
  modifiedTime,
  articleTags,
  noindex = false,
}: SEOHeadProps) => {
  const finalTitle = title === "ToolMaster Pro" ? title : `${title} | ToolMaster Pro`;
  const truncatedTitle = finalTitle.length > 60 ? finalTitle.substring(0, 57) + "..." : finalTitle;
  const truncatedDesc = description.length > 160 ? description.substring(0, 157) + "..." : description;
  const finalCanonical = normalizeCanonicalUrl(canonical || SITE_URL);

  const robotsContent = noindex
    ? "noindex, nofollow"
    : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

  // BreadcrumbList JSON-LD
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? normalizeCanonicalUrl(item.url) : toCanonicalUrl(item.url),
    })),
  } : null;

  // Combine all JSON-LD schemas
  const allSchemas: object[] = [];
  if (breadcrumbSchema) allSchemas.push(breadcrumbSchema);
  if (jsonLd) {
    if (Array.isArray(jsonLd)) allSchemas.push(...jsonLd);
    else allSchemas.push(jsonLd);
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{truncatedTitle}</title>
      <meta name="title" content={truncatedTitle} />
      <meta name="description" content={truncatedDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="bingbot" content={robotsContent} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="content-language" content="en-US" />
      <meta name="language" content="English" />
      <meta name="rating" content="General" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="3 days" />

      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />
      <link rel="alternate" hrefLang="en" href={finalCanonical} />
      <link rel="alternate" hrefLang="x-default" href={finalCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="ToolMaster Pro" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={finalCanonical} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && type === "article" && <meta property="article:author" content={author} />}
      {articleTags?.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ToolMasterPro" />
      <meta name="twitter:creator" content="@ToolMasterPro" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:domain" content="toolmaster.cloud" />
      <meta name="twitter:url" content={finalCanonical} />

      {/* PWA / Mobile */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="ToolMaster Pro" />

      {/* JSON-LD Structured Data */}
      {allSchemas.map((schema, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Helmet>
  );
};
