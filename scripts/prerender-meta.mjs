import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const buildDir = path.join(root, "build");
const siteUrl = "https://toolmaster.cloud";

const acronymWords = new Set([
  "ai",
  "api",
  "pdf",
  "qr",
  "url",
  "seo",
  "csv",
  "json",
  "xml",
  "yaml",
  "sql",
  "html",
  "css",
  "png",
  "jpg",
  "heic",
  "gif",
  "svg",
  "ocr",
  "ip",
  "uuid",
]);

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
    heading: "ToolMaster Pro - Free Online Tools",
    description:
      "Access 150+ free online tools for images, PDFs, text, SEO, developers, calculators, QR codes, file conversion, and everyday productivity.",
  },
  "/tools": {
    title: "All Free Online Tools | ToolMaster Pro",
    heading: "All Free Online Tools",
    description:
      "Browse ToolMaster Pro's free browser-based tools for images, PDFs, text, SEO, developers, calculators, QR codes, file converters, and more.",
  },
  "/blog": {
    title: "ToolMaster Blog | Free Tool Guides and Tutorials",
    heading: "ToolMaster Blog",
    description:
      "Read practical guides for online tools, image editing, PDF workflows, developer utilities, SEO, security, and productivity.",
  },
  "/about": {
    title: "About ToolMaster Pro | Free Online Tools",
    heading: "About ToolMaster Pro",
    description:
      "Learn about ToolMaster Pro, a collection of free browser-based tools for everyday productivity, creators, developers, and businesses.",
  },
  "/contact": {
    title: "Contact ToolMaster Pro",
    heading: "Contact ToolMaster Pro",
    description:
      "Contact ToolMaster Pro for support, feedback, partnerships, and questions about the free online tools.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | ToolMaster Pro",
    heading: "Privacy Policy",
    description:
      "Read the ToolMaster Pro privacy policy and learn how the site handles data while providing free online tools.",
  },
  "/terms-of-service": {
    title: "Terms of Service | ToolMaster Pro",
    heading: "Terms of Service",
    description:
      "Review the terms of service for using ToolMaster Pro's free online tools and website.",
  },
  "/cookie-policy": {
    title: "Cookie Policy | ToolMaster Pro",
    heading: "Cookie Policy",
    description: "Learn how ToolMaster Pro uses cookies and similar technologies.",
  },
  "/disclaimer": {
    title: "Disclaimer | ToolMaster Pro",
    heading: "Disclaimer",
    description:
      "Read the ToolMaster Pro disclaimer for information about using the free online tools and website content.",
  },
  "/dmca": {
    title: "DMCA Policy | ToolMaster Pro",
    heading: "DMCA Policy",
    description: "Review ToolMaster Pro's DMCA policy and copyright takedown information.",
  },
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const normalizePath = (value) => {
  if (!value || value === "/") return "/";
  return `/${value.split("/").filter(Boolean).join("/")}`;
};

const hrefPath = (value) => {
  const normalized = normalizePath(value);
  return normalized === "/" ? "/" : `${normalized}/`;
};

const canonicalUrl = (pagePath) => `${siteUrl}${hrefPath(pagePath)}`;

const slugToTitle = (slug) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (acronymWords.has(part)) return part.toUpperCase();
      if (part === "wifi") return "WiFi";
      if (part === "webp") return "WebP";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");

const categoryToSlug = (category) =>
  category
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const routePath = (url) => {
  const parsed = new URL(url);
  return normalizePath(parsed.pathname);
};

const readToolMetadata = async () => {
  const source = await readFile(path.join(root, "src", "data", "allTools.ts"), "utf8");
  const toolsByPath = new Map();
  const tools = [];
  const pattern =
    /\{\s*icon:\s*[^,]+,\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*path:\s*"([^"]+)"/g;

  for (const match of source.matchAll(pattern)) {
    const [, title, description, category, rawToolPath] = match;
    const toolPath = normalizePath(rawToolPath);
    const existing = toolsByPath.get(toolPath);

    if (existing) {
      if (!existing.categories.includes(category)) existing.categories.push(category);
      existing.category = existing.categories.join(" / ");
      continue;
    }

    const tool = {
      title,
      description,
      category,
      categories: [category],
      path: toolPath,
    };
    toolsByPath.set(toolPath, tool);
    tools.push(tool);
  }

  return { tools, toolsByPath };
};

const getMetadata = (pagePath, toolsByPath) => {
  if (toolsByPath.has(pagePath)) {
    const tool = toolsByPath.get(pagePath);
    return {
      type: "tool",
      title: `${tool.title} | ToolMaster Pro`,
      heading: tool.title,
      description: `${tool.description}. Free browser-based ${tool.category.toLowerCase()} utility with no signup required.`,
      tool,
    };
  }

  if (staticPages[pagePath]) return { type: "static", ...staticPages[pagePath] };

  if (pagePath.startsWith("/category/")) {
    const slug = pagePath.split("/").pop();
    const label = categoryLabels[slug] || slugToTitle(slug);
    const categoryNoun = label.toLowerCase().endsWith("tools") ? label : `${label} Tools`;
    return {
      type: "category",
      categorySlug: slug,
      categoryLabel: label,
      title: `${label} Tools | ToolMaster Pro`,
      heading: `Free ${categoryNoun}`,
      description: `Browse free ${categoryNoun.toLowerCase()} on ToolMaster Pro. Use browser-based utilities with instant results and no signup required.`,
    };
  }

  if (pagePath.startsWith("/blog/")) {
    const heading = slugToTitle(pagePath.split("/").pop());
    return {
      type: "blog",
      title: `${heading} | ToolMaster Blog`,
      heading,
      description: `Read the ToolMaster Pro guide: ${heading}. Practical tips for using free online tools and improving everyday workflows.`,
    };
  }

  const heading = slugToTitle(pagePath.split("/").filter(Boolean).pop() || "ToolMaster Pro");
  return {
    type: pagePath.startsWith("/tools/") ? "tool" : "static",
    title: `${heading} | ToolMaster Pro`,
    heading,
    description: `Use ${heading} on ToolMaster Pro. Free browser-based online tool with no signup required.`,
  };
};

const replaceOrInsert = (html, pattern, replacement, insertBefore = "</head>") => {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(insertBefore, `${replacement}\n${insertBefore}`);
};

const toolCard = (tool) => `
          <li class="fallback-card">
            <a href="${hrefPath(tool.path)}">${escapeHtml(tool.title)}</a><br />
            <span>${escapeHtml(tool.description)}</span>
          </li>`;

const buildToolList = (tools, limit = tools.length) =>
  tools
    .slice(0, limit)
    .map(toolCard)
    .join("");

const inferToolFromPath = (toolPath) => {
  const title = slugToTitle(toolPath.split("/").pop());
  return {
    title,
    description: `Open the ${title} tool on ToolMaster Pro.`,
    category: "Online Tools",
    categories: ["Online Tools"],
    path: toolPath,
  };
};

const collectFallbackTools = (tools, paths) => {
  const byPath = new Map(tools.map((tool) => [tool.path, tool]));

  for (const pagePath of paths) {
    if (pagePath.startsWith("/tools/") && !byPath.has(pagePath)) {
      byPath.set(pagePath, inferToolFromPath(pagePath));
    }
  }

  return [...byPath.values()].sort((a, b) => a.title.localeCompare(b.title));
};

const getRelatedTools = (metadata, allFallbackTools) => {
  if (metadata.type === "category") {
    return allFallbackTools.filter((tool) =>
      tool.categories.some((category) => categoryToSlug(category) === metadata.categorySlug),
    );
  }

  if (metadata.tool) {
    const categorySet = new Set(metadata.tool.categories);
    return allFallbackTools
      .filter((tool) => tool.path !== metadata.tool.path)
      .filter((tool) => tool.categories.some((category) => categorySet.has(category)))
      .slice(0, 8);
  }

  return allFallbackTools.slice(0, 12);
};

const renderFallback = (pagePath, metadata, allFallbackTools) => {
  const isAllTools = pagePath === "/tools";
  const isHome = pagePath === "/";
  const relatedTools = isAllTools || isHome ? allFallbackTools : getRelatedTools(metadata, allFallbackTools);
  const categoryLinks = Object.entries(categoryLabels)
    .map(([slug, label]) => `<a href="/category/${slug}/">${escapeHtml(label)}</a>`)
    .join("");

  const primaryToolList = buildToolList(relatedTools, isAllTools || isHome ? allFallbackTools.length : 12);
  const toolSectionHeading =
    isAllTools || isHome
      ? "Browse free online tools"
      : metadata.type === "category"
        ? `${metadata.categoryLabel} tools`
        : "Related tools";

  const toolSpecificContent =
    metadata.type === "tool"
      ? `
        <section>
          <h2>About this tool</h2>
          <p>${escapeHtml(metadata.description)} The interactive tool loads in the browser and is designed for quick, no-signup use.</p>
        </section>
        <section>
          <h2>How to use it</h2>
          <ol>
            <li>Open the tool page in a modern browser.</li>
            <li>Enter the text, file, link, or settings the tool asks for.</li>
            <li>Review, copy, or download the result when processing finishes.</li>
          </ol>
        </section>`
      : "";

  return `
    <main class="seo-fallback" id="seo-fallback" aria-label="${escapeHtml(metadata.heading)} page summary">
      <header>
        <p><a href="/">ToolMaster Pro</a> / <a href="/tools/">All tools</a></p>
        <h1>${escapeHtml(metadata.heading)}</h1>
        <p>${escapeHtml(metadata.description)}</p>
      </header>

      ${toolSpecificContent}

      <section>
        <h2>${escapeHtml(toolSectionHeading)}</h2>
        <ul class="fallback-grid">
${primaryToolList}
        </ul>
      </section>

      <section>
        <h2>Tool categories</h2>
        <nav class="fallback-links" aria-label="Tool categories">
          ${categoryLinks}
        </nav>
      </section>

      <footer>
        <nav class="fallback-links" aria-label="Company links">
          <a href="/about/">About</a>
          <a href="/contact/">Contact</a>
          <a href="/privacy-policy/">Privacy Policy</a>
          <a href="/terms-of-service/">Terms of Service</a>
          <a href="/cookie-policy/">Cookie Policy</a>
          <a href="/blog/">Blog</a>
        </nav>
      </footer>
    </main>`;
};

const renderNoscript = () => `
  <noscript>
    <style>#initial-loader{display:none}</style>
    <div style="max-width:760px;margin:0 auto;padding:24px 20px;font-family:system-ui,sans-serif;color:#475569;">
      JavaScript is required for the interactive tools. A crawlable page summary and tool links are available below.
    </div>
  </noscript>`;

const renderPageHtml = (baseHtml, pagePath, metadata, allFallbackTools) => {
  const canonical = canonicalUrl(pagePath);
  let html = baseHtml;

  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  html = replaceOrInsert(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
  );
  html = replaceOrInsert(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`);
  html = replaceOrInsert(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
  );
  html = replaceOrInsert(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`);
  html = replaceOrInsert(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
  );
  html = replaceOrInsert(html, /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${canonical}" />`);
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/i, renderNoscript());
  html = html.replace(
    /<main\s+class="seo-fallback"\s+id="seo-fallback"[\s\S]*?<\/main>\s*<!-- Loading State -->/i,
    `${renderFallback(pagePath, metadata, allFallbackTools)}\n\n    <!-- Loading State -->`,
  );

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
  const { tools, toolsByPath } = await readToolMetadata();
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const paths = [...new Set(locs.map(routePath))];
  const allFallbackTools = collectFallbackTools(tools, paths);

  for (const pagePath of paths) {
    const metadata = getMetadata(pagePath, toolsByPath);
    const html = renderPageHtml(baseHtml, pagePath, metadata, allFallbackTools);
    await writeRouteHtml(pagePath, html);
  }

  console.log(`Prerendered metadata and fallback content for ${paths.length} sitemap URLs.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
