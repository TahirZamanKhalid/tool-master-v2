import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const siteUrl = "https://toolmaster.cloud";
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

const staticPages = [
  "/",
  "/tools",
  "/blog",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/cookie-policy",
  "/disclaimer",
  "/dmca",
];

const categorySlugs = [
  "ai-content",
  "business-tools",
  "calculators",
  "developer-tools",
  "file-converters",
  "generators",
  "image-tools",
  "pdf-tools",
  "qr-barcodes",
  "security-tools",
  "seo-marketing",
  "social-media",
  "text-tools",
  "utilities",
  "video-tools",
];

const legacyRedirects = new Set([
  "/tools/base64-image-encoder",
  "/tools/wifi-qr-generator",
  "/tools/watermark",
  "/tools/pdf-tools",
  "/tools/image-compressor",
  "/tools/word-counter",
  "/tools/unit-converter",
  "/tools/random-number",
  "/tools/stopwatch",
  "/blog/remove-background-image-free-ai-guide",
]);

const excludedRoutes = new Set(["/auth"]);

// High-value tools that deserve higher priority
const highPriorityTools = new Set([
  "background-remover", "qr-code-generator", "pdf-merger", "image-size-reducer",
  "image-to-text", "json-formatter", "advanced-image-editor", "watermark-tool",
  "photo-collage-maker", "gif-maker", "pdf-editor", "resume-builder",
  "api-tester", "premium-video-editor", "premium-video-compressor",
  "premium-video-merger", "premium-video-watermark", "invoice-generator",
  "essay-writer", "blog-article-writer", "excel-to-csv", "csv-to-excel",
  "png-to-jpg", "jpg-to-png", "heic-to-jpg", "pdf-to-images",
  "premium-plus-word-counter", "premium-plus-unit-converter",
  "premium-plus-batch-image-resizer", "premium-plus-random-number-generator",
  "premium-plus-multi-stopwatch", "advanced-password-generator",
  "tip-calculator", "discount-calculator", "loan-calculator", "gpa-calculator",
  "compound-interest-calculator", "tdee-calculator", "budget-planner",
  "savings-goal-calculator", "date-difference-calculator", "svg-to-png",
  "hashtag-generator", "business-name-generator", "domain-name-generator",
  "email-signature-generator", "instagram-bio-generator", "youtube-title-generator",
  "fake-data-generator", "random-name-generator", "company-name-generator",
  "product-name-generator", "tagline-generator", "keyword-research",
  "robots-txt-generator", "schema-markup-generator", "seo-content-analyzer",
  "title-meta-checker", "heading-analyzer", "alt-text-generator",
  "canonical-url-generator", "sitemap-validator", "breadcrumb-generator",
]);

/**
 * Determine SEO metadata (changefreq + priority) based on page type.
 */
const getSeoMeta = (pagePath) => {
  if (pagePath === "/") return { changefreq: "daily", priority: "1.0" };
  if (pagePath === "/tools") return { changefreq: "daily", priority: "0.95" };
  if (pagePath === "/blog") return { changefreq: "weekly", priority: "0.85" };
  if (pagePath === "/about" || pagePath === "/contact") return { changefreq: "monthly", priority: pagePath === "/about" ? "0.7" : "0.6" };

  // Legal / policy pages
  if (["/privacy-policy", "/terms-of-service", "/cookie-policy"].includes(pagePath)) return { changefreq: "yearly", priority: "0.4" };
  if (["/disclaimer", "/dmca"].includes(pagePath)) return { changefreq: "yearly", priority: "0.3" };

  // Category pages
  if (pagePath.startsWith("/category/")) return { changefreq: "weekly", priority: "0.85" };

  // Blog posts
  if (pagePath.startsWith("/blog/")) return { changefreq: "monthly", priority: "0.7" };

  // Tool pages
  if (pagePath.startsWith("/tools/")) {
    const slug = pagePath.replace("/tools/", "");
    return highPriorityTools.has(slug)
      ? { changefreq: "weekly", priority: "0.9" }
      : { changefreq: "weekly", priority: "0.75" };
  }

  return { changefreq: "monthly", priority: "0.5" };
};

const normalizePath = (value) => {
  if (!value || value === "/") return "/";
  return `/${value.split("/").filter(Boolean).join("/")}`;
};

const canonicalUrl = (pagePath) => {
  const normalized = normalizePath(pagePath);
  return normalized === "/" ? `${siteUrl}/` : `${siteUrl}${normalized}/`;
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const readConcreteRoutes = async () => {
  const appSource = await readFile(path.join(root, "src", "App.tsx"), "utf8");
  return [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
    .map((match) => normalizePath(match[1]))
    .filter((route) => route.startsWith("/"))
    .filter((route) => route !== "/*")
    .filter((route) => !route.includes(":"))
    .filter((route) => !legacyRedirects.has(route))
    .filter((route) => !excludedRoutes.has(route));
};

const readBlogRoutes = async () => {
  const blogSource = await readFile(path.join(root, "src", "data", "blogPosts.ts"), "utf8");
  return [...blogSource.matchAll(/slug:\s*"([^"]+)"/g)]
    .map((match) => `/blog/${match[1]}`)
    .filter((route) => !legacyRedirects.has(route));
};

const main = async () => {
  const routes = await readConcreteRoutes();
  const blogRoutes = await readBlogRoutes();
  const categoryRoutes = categorySlugs.map((slug) => `/category/${slug}`);

  const paths = [
    ...staticPages,
    ...categoryRoutes,
    ...routes,
    ...blogRoutes,
  ].map(normalizePath);

  const uniquePaths = [...new Set(paths)].filter((pagePath) => !legacyRedirects.has(pagePath));

  const urlEntries = uniquePaths.map((pagePath) => {
    const { changefreq, priority } = getSeoMeta(pagePath);
    return [
      "  <url>",
      `    <loc>${escapeXml(canonicalUrl(pagePath))}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    "",
    ...urlEntries,
    "",
    "</urlset>",
    "",
  ].join("\n");

  await writeFile(path.join(root, "public", "sitemap.xml"), xml, "utf8");
  console.log(`Generated sitemap.xml with ${uniquePaths.length} canonical URLs (with lastmod, changefreq, priority).`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
