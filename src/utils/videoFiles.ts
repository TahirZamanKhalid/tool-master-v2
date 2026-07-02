import { getSafeFileStem } from "@/utils/imageFiles";

export const MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024;
export const MAX_WATERMARK_IMAGE_SIZE = 20 * 1024 * 1024;

export const isVideoFile = (file: File) => file.type.startsWith("video/");

export const isImageFile = (file: File) => file.type.startsWith("image/");

export const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${Math.round(value * 100) / 100} ${units[index]}`;
};

export const validateVideoFile = (file: File) => {
  if (!isVideoFile(file)) {
    return "Please upload a valid video file.";
  }

  if (file.size > MAX_VIDEO_FILE_SIZE) {
    return `Video is too large. Maximum size is ${formatFileSize(MAX_VIDEO_FILE_SIZE)}.`;
  }

  return "";
};

export const validateWatermarkImageFile = (file: File) => {
  if (!isImageFile(file)) {
    return "Please upload a valid image file.";
  }

  if (file.size > MAX_WATERMARK_IMAGE_SIZE) {
    return `Image is too large. Maximum size is ${formatFileSize(MAX_WATERMARK_IMAGE_SIZE)}.`;
  }

  return "";
};

export const getVideoMimeType = (format: string) => {
  switch (format) {
    case "webm":
      return "video/webm";
    case "avi":
      return "video/x-msvideo";
    case "mov":
      return "video/quicktime";
    case "mkv":
      return "video/x-matroska";
    default:
      return "video/mp4";
  }
};

export const getVideoDownloadName = (prefix: string, source: File | null | undefined, format: string) => {
  const stem = getSafeFileStem(source?.name || prefix, "video");
  return `${prefix}-${stem}.${format}`;
};

export const revokeMediaUrl = (url: string) => {
  if (url) URL.revokeObjectURL(url);
};

export const escapeDrawTextValue = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'").replace(/\r?\n/g, " ");

export const getAtempoFilters = (speed: number) => {
  if (speed === 1) return [];

  const filters: string[] = [];
  let remaining = speed;

  while (remaining > 2) {
    filters.push("atempo=2");
    remaining /= 2;
  }

  while (remaining < 0.5) {
    filters.push("atempo=0.5");
    remaining /= 0.5;
  }

  if (remaining !== 1) {
    filters.push(`atempo=${Number(remaining.toFixed(3))}`);
  }

  return filters;
};
