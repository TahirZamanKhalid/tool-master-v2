const LANGUAGE_FALLBACK_NAMES: Record<string, string> = {
  af: "Afrikaans",
  am: "Amharic",
  ar: "Arabic",
  bg: "Bulgarian",
  bn: "Bengali",
  ca: "Catalan",
  cs: "Czech",
  cy: "Welsh",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  es: "Spanish",
  et: "Estonian",
  fa: "Persian",
  fi: "Finnish",
  fil: "Filipino",
  fr: "French",
  gu: "Gujarati",
  he: "Hebrew",
  hi: "Hindi",
  hr: "Croatian",
  hu: "Hungarian",
  id: "Indonesian",
  is: "Icelandic",
  it: "Italian",
  ja: "Japanese",
  kn: "Kannada",
  ko: "Korean",
  lt: "Lithuanian",
  lv: "Latvian",
  ml: "Malayalam",
  mr: "Marathi",
  ms: "Malay",
  nb: "Norwegian",
  nl: "Dutch",
  no: "Norwegian",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  sl: "Slovenian",
  sr: "Serbian",
  sv: "Swedish",
  sw: "Swahili",
  ta: "Tamil",
  te: "Telugu",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  ur: "Urdu",
  vi: "Vietnamese",
  yue: "Cantonese",
  zh: "Chinese",
};

const VOICE_PREVIEW_TEXT: Record<string, string> = {
  ar: "مرحبا، هذا مثال لاختبار وضوح الصوت ونبرته.",
  de: "Willkommen bei ToolMaster Pro. Dies ist eine kurze Stimmprobe.",
  en: "Welcome to ToolMaster Pro. Compare this voice for clarity, tone, and accent.",
  es: "Bienvenido a ToolMaster Pro. Esta es una breve muestra de voz.",
  fr: "Bienvenue sur ToolMaster Pro. Voici un court aperçu de cette voix.",
  hi: "टूलमास्टर प्रो में आपका स्वागत है। यह आवाज़ का एक छोटा नमूना है।",
  id: "Selamat datang di ToolMaster Pro. Ini adalah contoh suara singkat.",
  it: "Benvenuto su ToolMaster Pro. Questo è un breve esempio della voce.",
  ja: "ツールマスタープロへようこそ。これは音声の短いサンプルです。",
  ko: "툴마스터 프로에 오신 것을 환영합니다. 짧은 음성 미리보기입니다.",
  nl: "Welkom bij ToolMaster Pro. Dit is een kort voorbeeld van de stem.",
  pl: "Witamy w ToolMaster Pro. To jest krótka próbka głosu.",
  pt: "Bem-vindo ao ToolMaster Pro. Esta é uma breve amostra de voz.",
  ru: "Добро пожаловать в ToolMaster Pro. Это короткий пример голоса.",
  sv: "Välkommen till ToolMaster Pro. Det här är ett kort röstprov.",
  th: "ยินดีต้อนรับสู่ ToolMaster Pro นี่คือตัวอย่างเสียงสั้น ๆ",
  tr: "ToolMaster Pro'ya hoş geldiniz. Bu kısa bir ses örneğidir.",
  ur: "ٹول ماسٹر پرو میں خوش آمدید۔ یہ آواز کا ایک مختصر نمونہ ہے۔",
  vi: "Chào mừng đến với ToolMaster Pro. Đây là một mẫu giọng nói ngắn.",
  zh: "欢迎使用 ToolMaster Pro。这是一段简短的语音示例。",
};

interface DisplayNamesLike {
  of(code: string): string | undefined;
}

interface DisplayNamesConstructor {
  new (
    locales: string | string[],
    options: { type: "language"; languageDisplay?: "dialect" | "standard" },
  ): DisplayNamesLike;
}

const createLanguageDisplayNames = () => {
  const DisplayNames = (
    Intl as unknown as { DisplayNames?: DisplayNamesConstructor }
  ).DisplayNames;

  if (!DisplayNames) return null;

  try {
    return new DisplayNames(["en"], {
      type: "language",
      languageDisplay: "dialect",
    });
  } catch {
    return null;
  }
};

const languageDisplayNames = createLanguageDisplayNames();
const ENHANCED_VOICE_PATTERN =
  /\b(natural|neural|enhanced|premium|studio|wavenet)\b/i;

export const normalizeLanguageTag = (languageTag: string) => {
  const cleaned = languageTag.trim().replace(/_/g, "-");
  if (!cleaned) return "und";

  try {
    return Intl.getCanonicalLocales(cleaned)[0] || cleaned;
  } catch {
    return cleaned;
  }
};

export const getBaseLanguage = (languageTag: string) =>
  normalizeLanguageTag(languageTag).split("-")[0].toLowerCase();

export const getLanguageLabel = (languageTag: string) => {
  const baseLanguage = getBaseLanguage(languageTag);
  const displayed = languageDisplayNames?.of(baseLanguage);

  return displayed || LANGUAGE_FALLBACK_NAMES[baseLanguage] || baseLanguage.toUpperCase();
};

export const getAccentLabel = (languageTag: string) => {
  const normalized = normalizeLanguageTag(languageTag);
  const baseLanguage = getBaseLanguage(normalized);

  if (normalized.toLowerCase() === baseLanguage) {
    return `General ${getLanguageLabel(baseLanguage)}`;
  }

  const displayed = languageDisplayNames?.of(normalized);
  if (displayed && displayed.toLowerCase() !== normalized.toLowerCase()) {
    return displayed;
  }

  return `${getLanguageLabel(baseLanguage)} (${normalized
    .split("-")
    .slice(1)
    .join("-")})`;
};

export const getVoiceId = (voice: SpeechSynthesisVoice) =>
  [
    voice.voiceURI || voice.name,
    normalizeLanguageTag(voice.lang),
    voice.localService ? "local" : "network",
  ].join("::");

export const isEnhancedVoice = (voice: SpeechSynthesisVoice) =>
  ENHANCED_VOICE_PATTERN.test(voice.name);

const getVoiceQualityScore = (
  voice: SpeechSynthesisVoice,
  preferredLanguage?: string,
) => {
  let score = 0;
  const voiceLanguage = normalizeLanguageTag(voice.lang).toLowerCase();
  const preferred = preferredLanguage
    ? normalizeLanguageTag(preferredLanguage).toLowerCase()
    : "";

  if (preferred && voiceLanguage === preferred) score += 24;
  if (preferred && getBaseLanguage(voiceLanguage) === getBaseLanguage(preferred)) {
    score += 12;
  }
  if (voice.default) score += 8;
  if (isEnhancedVoice(voice)) score += 6;
  if (voice.localService) score += 2;

  return score;
};

export const sortAndDedupeVoices = (voices: SpeechSynthesisVoice[]) => {
  const uniqueVoices = new Map<string, SpeechSynthesisVoice>();

  for (const voice of voices) {
    const id = getVoiceId(voice);
    if (!uniqueVoices.has(id)) uniqueVoices.set(id, voice);
  }

  return [...uniqueVoices.values()].sort((left, right) => {
    const languageComparison = normalizeLanguageTag(left.lang).localeCompare(
      normalizeLanguageTag(right.lang),
    );
    if (languageComparison !== 0) return languageComparison;

    const scoreComparison =
      getVoiceQualityScore(right) - getVoiceQualityScore(left);
    if (scoreComparison !== 0) return scoreComparison;

    return left.name.localeCompare(right.name);
  });
};

export const pickBestVoice = (
  voices: SpeechSynthesisVoice[],
  preferredLanguage?: string,
) =>
  [...voices].sort((left, right) => {
    const scoreComparison =
      getVoiceQualityScore(right, preferredLanguage) -
      getVoiceQualityScore(left, preferredLanguage);

    return scoreComparison || left.name.localeCompare(right.name);
  })[0];

const splitLongSegment = (segment: string, maxLength: number) => {
  if (segment.length <= maxLength) return [segment];

  const words = segment.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    const slices: string[] = [];
    for (let index = 0; index < segment.length; index += maxLength) {
      slices.push(segment.slice(index, index + maxLength));
    }
    return slices;
  }

  const slices: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > maxLength) {
      if (current) {
        slices.push(current);
        current = "";
      }
      slices.push(...splitLongSegment(word, maxLength));
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength) {
      slices.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) slices.push(current);
  return slices;
};

export const splitTextIntoSpeechChunks = (
  input: string,
  maxLength = 240,
) => {
  const paragraphs = input
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const pushSegment = (segment: string) => {
    for (const part of splitLongSegment(segment, maxLength)) {
      const candidate = current ? `${current} ${part}` : part;
      if (candidate.length > maxLength) {
        if (current) chunks.push(current);
        current = part;
      } else {
        current = candidate;
      }
    }
  };

  for (const paragraph of paragraphs) {
    const sentences =
      paragraph.match(/[^.!?。！？؟]+[.!?。！？؟]*/gu)?.map((item) => item.trim()) ||
      [paragraph];

    for (const sentence of sentences.filter(Boolean)) pushSegment(sentence);
    if (current) {
      chunks.push(current);
      current = "";
    }
  }

  if (current) chunks.push(current);
  return chunks;
};

export const getVoicePreviewText = (languageTag: string) =>
  VOICE_PREVIEW_TEXT[getBaseLanguage(languageTag)] ||
  "ToolMaster Pro. This is a short voice preview.";

export const estimateSpeechDuration = (text: string, rate: number) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "0 sec";

  const tokenCount = normalized.match(/[\p{L}\p{N}]+/gu)?.length || 0;
  const characterEstimate = Math.ceil(
    normalized.replace(/\s/g, "").length / 6,
  );
  const estimatedWords = Math.max(tokenCount, characterEstimate);
  const seconds = Math.max(
    1,
    Math.round((estimatedWords / Math.max(90, 180 * rate)) * 60),
  );

  if (seconds < 60) return `${seconds} sec`;
  return `${Math.ceil(seconds / 60)} min`;
};
