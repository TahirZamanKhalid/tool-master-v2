import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const siteUrl = "https://toolmaster.cloud";

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

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...uniquePaths.map((pagePath) => `  <url><loc>${escapeXml(canonicalUrl(pagePath))}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  await writeFile(path.join(root, "public", "sitemap.xml"), xml, "utf8");
  console.log(`Generated sitemap.xml with ${uniquePaths.length} canonical URLs.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
