export const splitWords = (text: string): string[] => text.trim().split(/\s+/).filter(Boolean);

export const countWords = (text: string): number => splitWords(text).length;

export const reverseText = (text: string): string => Array.from(text).reverse().join("");

export const createSlug = (text: string): string =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const wordsForCase = (text: string): string[] =>
  text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

const capitalize = (word: string): string => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "");

export const toTitleCaseText = (text: string): string => wordsForCase(text).map(capitalize).join(" ");

export const toSentenceCaseText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (match) => match.toUpperCase());

export const toCamelCaseText = (text: string): string => {
  const words = wordsForCase(text);
  return words.map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word))).join("");
};

export const toSnakeCaseText = (text: string): string => wordsForCase(text).map((word) => word.toLowerCase()).join("_");

export const toKebabCaseText = (text: string): string => wordsForCase(text).map((word) => word.toLowerCase()).join("-");

export const textToBinaryUtf8 = (text: string): string =>
  Array.from(new TextEncoder().encode(text))
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join(" ");

export const binaryToTextUtf8 = (binary: string): string => {
  const chunks = binary.trim().split(/\s+/).filter(Boolean);
  if (chunks.length === 0) return "";
  if (!chunks.every((chunk) => /^[01]{8}$/.test(chunk))) {
    throw new Error("Binary input must use 8-bit groups separated by spaces");
  }
  const bytes = Uint8Array.from(chunks.map((chunk) => parseInt(chunk, 2)));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
};

export const caesarShift = (text: string, shift: number): string => {
  const normalizedShift = ((shift % 26) + 26) % 26;
  return text
    .split("")
    .map((char) => {
      if (!/[a-z]/i.test(char)) return char;
      const code = char.charCodeAt(0);
      const base = code >= 65 && code <= 90 ? 65 : 97;
      return String.fromCharCode(((code - base + normalizedShift) % 26) + base);
    })
    .join("");
};

export const decodeHtmlEntities = (input: string): string => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = input;
  return textarea.value;
};

export const encodeHtmlEntities = (input: string): string =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
