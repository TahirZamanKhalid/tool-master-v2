import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const buildDir = path.join(root, "build");

const stylesheetLinkPattern =
  /<link\s+rel="stylesheet"(\s+crossorigin)?\s+href="(\/assets\/index-[^"]+\.css)"\s*\/?>/i;

const findHtmlFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files;
};

const optimizeHtmlFile = async (filePath) => {
  const html = await readFile(filePath, "utf8");
  const match = html.match(stylesheetLinkPattern);

  if (!match) return false;

  const [, crossoriginAttr = "", href] = match;
  const crossorigin = crossoriginAttr ? " crossorigin" : "";
  const optimized = [
    `<link rel="preload"${crossorigin} href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
    `<noscript><link rel="stylesheet"${crossorigin} href="${href}"></noscript>`,
  ].join("\n  ");

  const updated = html.replace(stylesheetLinkPattern, optimized);

  await writeFile(filePath, updated, "utf8");
  return { filePath, href };
};

const main = async () => {
  const htmlFiles = await findHtmlFiles(buildDir);
  const optimized = [];

  for (const filePath of htmlFiles) {
    const result = await optimizeHtmlFile(filePath);
    if (result) optimized.push(result);
  }

  if (optimized.length === 0) {
    throw new Error("Could not find generated stylesheet links to optimize.");
  }

  console.log(`Optimized non-blocking CSS delivery in ${optimized.length} HTML files.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
