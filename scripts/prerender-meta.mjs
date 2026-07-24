import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const buildDir = path.join(root, "build");
const siteUrl = "https://toolmaster.cloud";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const slugToTitle = (slug) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (["ai", "api", "pdf", "qr", "url", "seo", "csv", "json", "xml", "yaml", "sql", "html", "css", "png", "jpg", "heic", "gif", "svg", "ocr", "ip", "uuid"].includes(part)) {
        return part.toUpperCase();
      }
      if (part === "wifi") return "WiFi";
      if (part === "webp") return "WebP";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");

const routePath = (url) => {
  const parsed = new URL(url);
  return parsed.pathname === "/" ? "/" : parsed.pathname.replace(/\/$/, "");
};

const canonicalUrl = (pagePath) => `${siteUrl}${pagePath === "/" ? "/" : `${pagePath.replace(/\/$/, "")}/`}`;

const readToolMetadata = async () => {
  const source = await readFile(path.join(root, "src", "data", "allTools.ts"), "utf8");
  const tools = new Map();
  const pattern = /\{\s*icon:\s*[^,]+,\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*path:\s*"([^"]+)"/g;

  for (const match of source.matchAll(pattern)) {
    const [, title, description, category, toolPath] = match;
    tools.set(toolPath, { title, description, category });
  }

  return tools;
};

const categoryLabels = {
  "ai-content": "AI & Content",
  "business-tools": "Business Tools",
  calculators: "Calculators",
  "developer-tools": "Developer Tools",
  "file-converters": "File Converters",
  generators: "Generators",
  "image-tools": "Image Tools",
  "pdf-tools": "PDF Tools",
  "qr-barcodes": "QR & Barcodes",
  "security-tools": "Security Tools",
  "seo-marketing": "SEO & Marketing",
  "social-media": "Social Media",
  "text-tools": "Text Tools",
  utilities: "Utilities",
  "video-tools": "Video Tools",
};

const staticPages = {
  "/": {
    title: "ToolMaster Pro - 150+ Free Online Tools | No Registration Required",
    description: "Access 150+ free online tools. Background remover, PDF merger, image compressor, QR generator, AI writing tools, calculators, and more.",
  },
  "/tools": {
    title: "All Free Online Tools | ToolMaster Pro",
    description: "Browse ToolMaster Pro's free browser-based tools for images, PDFs, text, SEO, developers, calculators, QR codes, and more.",
  },
  "/blog": {
    title: "ToolMaster Blog | Free Tool Guides and Tutorials",
    description: "Read practical guides for online tools, image editing, PDF workflows, developer utilities, SEO, security, and productivity.",
  },
  "/about": {
    title: "About ToolMaster Pro | Free Online Tools",
    description: "Learn about ToolMaster Pro, a collection of free browser-based tools for everyday productivity, creators, developers, and businesses.",
  },
  "/contact": {
    title: "Contact ToolMaster Pro",
    description: "Contact the ToolMaster Pro team for support, feedback, partnerships, and questions about the free online tools.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | ToolMaster Pro",
    description: "Read the ToolMaster Pro privacy policy and learn how the site handles data while providing free online tools.",
  },
  "/terms-of-service": {
    title: "Terms of Service | ToolMaster Pro",
    description: "Review the terms of service for using ToolMaster Pro's free online tools and website.",
  },
  "/cookie-policy": {
    title: "Cookie Policy | ToolMaster Pro",
    description: "Learn how ToolMaster Pro uses cookies and similar technologies.",
  },
  "/disclaimer": {
    title: "Disclaimer | ToolMaster Pro",
    description: "Read the ToolMaster Pro disclaimer for information about use of the free online tools and website content.",
  },
  "/dmca": {
    title: "DMCA Policy | ToolMaster Pro",
    description: "Review ToolMaster Pro's DMCA policy and copyright takedown information.",
  },
};

const getMetadata = (pagePath, tools) => {
  if (tools.has(pagePath)) {
    const tool = tools.get(pagePath);
    return {
      title: `${tool.title} | ToolMaster Pro`,
      description: `${tool.description}. Free browser-based ${tool.category.toLowerCase()} utility with no signup required.`,
    };
  }

  if (staticPages[pagePath]) return staticPages[pagePath];

  if (pagePath.startsWith("/category/")) {
    const slug = pagePath.split("/").pop();
    const label = categoryLabels[slug] || slugToTitle(slug);
    return {
      title: `${label} Tools | ToolMaster Pro`,
      description: `Browse free ${label.toLowerCase()} tools on ToolMaster Pro. Browser-based utilities with instant results and no signup required.`,
    };
  }

  if (pagePath.startsWith("/blog/")) {
    const title = slugToTitle(pagePath.split("/").pop());
    return {
      title: `${title} | ToolMaster Blog`,
      description: `Read the ToolMaster Pro guide: ${title}. Practical tips for using free online tools and improving everyday workflows.`,
    };
  }

  const title = slugToTitle(pagePath.split("/").filter(Boolean).pop() || "ToolMaster Pro");
  return {
    title: `${title} | ToolMaster Pro`,
    description: `Use ${title} on ToolMaster Pro. Free browser-based online tool with no signup required.`,
  };
};

const replaceOrInsert = (html, pattern, replacement, insertBefore = "</head>") => {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(insertBefore, `${replacement}\n${insertBefore}`);
};

const renderPageHtml = (baseHtml, pagePath, metadata) => {
  const canonical = canonicalUrl(pagePath);
  let html = baseHtml;

  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  html = replaceOrInsert(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(metadata.description)}" />`);
  html = replaceOrInsert(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`);
  html = replaceOrInsert(html, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`);
  html = replaceOrInsert(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`);
  html = replaceOrInsert(html, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`);
  html = replaceOrInsert(html, /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${canonical}" />`);

  return html;
};

const writeRouteHtml = async (pagePath, html) => {
  if (pagePath === "/") {
    await writeFile(path.join(buildDir, "index.html"), html, "utf8");
    return;
  }

  const outputDir = path.join(buildDir, ...pagePath.split("/").filter(Boolean));
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "index.html"), html, "utf8");
};

const main = async () => {
  const baseHtml = await readFile(path.join(buildDir, "index.html"), "utf8");
  const sitemap = await readFile(path.join(buildDir, "sitemap.xml"), "utf8");
  const tools = await readToolMetadata();
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const paths = [...new Set(locs.map(routePath))];

  for (const pagePath of paths) {
    const metadata = getMetadata(pagePath, tools);
    const html = renderPageHtml(baseHtml, pagePath, metadata);
    await writeRouteHtml(pagePath, html);
  }

  console.log(`Prerendered metadata for ${paths.length} sitemap URLs.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
