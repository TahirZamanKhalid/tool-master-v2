import type { FFMessageLoadConfig, FFmpeg } from "@ffmpeg/ffmpeg";
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";

const FFMPEG_CORE_VERSION = "0.12.9";
const LOCAL_LOAD_TIMEOUT_MS = 180_000;
const FALLBACK_LOAD_TIMEOUT_MS = 60_000;

type FFmpegLoadCandidate = FFMessageLoadConfig & {
  timeoutMs: number;
};

const fallbackConfigs: FFmpegLoadCandidate[] = [
  {
    coreURL: `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm/ffmpeg-core.js`,
    wasmURL: `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm/ffmpeg-core.wasm`,
    timeoutMs: FALLBACK_LOAD_TIMEOUT_MS,
  },
  {
    coreURL: `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm/ffmpeg-core.js`,
    wasmURL: `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm/ffmpeg-core.wasm`,
    timeoutMs: FALLBACK_LOAD_TIMEOUT_MS,
  },
];

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number) =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      reject(new Error("FFmpeg core load timed out"));
    }, timeoutMs);

    promise.then(resolve, reject).finally(() => {
      globalThis.clearTimeout(timeoutId);
    });
  });

export const loadFFmpegCore = async (ffmpeg: FFmpeg) => {
  if (ffmpeg.loaded) return;

  const configs: FFmpegLoadCandidate[] = [{ coreURL, wasmURL, timeoutMs: LOCAL_LOAD_TIMEOUT_MS }, ...fallbackConfigs];
  let lastError: unknown;

  for (const config of configs) {
    const { timeoutMs, ...loadConfig } = config;
    try {
      await withTimeout(ffmpeg.load(loadConfig), timeoutMs);
      return;
    } catch (error) {
      lastError = error;
      ffmpeg.terminate();
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to load FFmpeg core");
};

export const deleteFFmpegFiles = async (ffmpeg: FFmpeg, files: string[]) => {
  for (const file of files) {
    try {
      await ffmpeg.deleteFile(file);
    } catch {
      // Missing temp files are harmless; this is only memory cleanup.
    }
  }
};
