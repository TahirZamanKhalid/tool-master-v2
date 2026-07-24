export const SITE_URL = "https://toolmaster.cloud";

export const normalizeCanonicalUrl = (url: string) => {
  const parsed = new URL(url, SITE_URL);

  parsed.protocol = "https:";
  parsed.hostname = "toolmaster.cloud";
  parsed.hash = "";
  parsed.search = "";

  if (parsed.pathname !== "/" && !parsed.pathname.endsWith("/")) {
    parsed.pathname = `${parsed.pathname}/`;
  }

  return parsed.toString();
};

export const toCanonicalUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizeCanonicalUrl(`${SITE_URL}${normalizedPath}`);
};
