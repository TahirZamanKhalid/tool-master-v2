import { useCallback, useEffect, useState } from "react";
import {
  getVoiceId,
  sortAndDedupeVoices,
} from "@/utils/speechSynthesis";

const voiceListsMatch = (
  current: SpeechSynthesisVoice[],
  next: SpeechSynthesisVoice[],
) =>
  current.length === next.length &&
  current.every((voice, index) => getVoiceId(voice) === getVoiceId(next[index]));

export const useSpeechVoices = () => {
  const isSupported =
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined";
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(isSupported);

  const refreshVoices = useCallback(() => {
    if (!isSupported) return [];

    const nextVoices = sortAndDedupeVoices(
      window.speechSynthesis.getVoices(),
    );

    setVoices((current) =>
      voiceListsMatch(current, nextVoices) ? current : nextVoices,
    );
    if (nextVoices.length > 0) setIsLoading(false);

    return nextVoices;
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) {
      setIsLoading(false);
      return;
    }

    const synth = window.speechSynthesis;
    const retryDelays = [0, 100, 400, 1000, 2000];
    const retryTimers = retryDelays.map((delay) =>
      window.setTimeout(refreshVoices, delay),
    );
    const settleTimer = window.setTimeout(() => setIsLoading(false), 2600);

    synth.addEventListener("voiceschanged", refreshVoices);
    window.addEventListener("focus", refreshVoices);

    return () => {
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(settleTimer);
      synth.removeEventListener("voiceschanged", refreshVoices);
      window.removeEventListener("focus", refreshVoices);
    };
  }, [isSupported, refreshVoices]);

  return {
    voices,
    isLoading,
    isSupported,
    refreshVoices,
  };
};
