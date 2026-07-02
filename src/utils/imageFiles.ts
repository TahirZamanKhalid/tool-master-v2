export const RASTER_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/gif",
] as const;

const EXTENSION_TO_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  bmp: "image/bmp",
  gif: "image/gif",
};

export const isRasterImageFile = (
  file: File,
  allowedTypes: readonly string[] = RASTER_IMAGE_TYPES,
) => {
  if (allowedTypes.includes(file.type)) return true;

  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const typeFromExtension = EXTENSION_TO_TYPE[extension];
  return Boolean(typeFromExtension && allowedTypes.includes(typeFromExtension));
};

export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
};

export const getSafeFileStem = (name: string, fallback = "image") => {
  const stem = name.replace(/\.[^.]+$/, "").trim();
  return stem.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
};

export const getOutputExtension = (format: string, fallback = "png") => {
  if (format === "jpeg" || format === "jpg") return "jpg";
  if (format === "png" || format === "webp" || format === "gif" || format === "bmp") return format;
  return fallback;
};

export const isHexColor = (value: string) => /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());

export const normalizeHexColor = (value: string) => {
  const trimmed = value.trim();
  if (!isHexColor(trimmed)) return null;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
};
