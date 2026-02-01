import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

interface APIKeyState {
  openaiKey: string | null;
  falKey: string | null;
  hasOpenAI: boolean;
  hasFal: boolean;
}

export function useAPIKeys() {
  const [keys, setKeys] = useState<APIKeyState>(() => {
    if (typeof window === "undefined") {
      return {
        openaiKey: null,
        falKey: null,
        hasOpenAI: false,
        hasFal: false,
      };
    }
    const openai = localStorage.getItem(STORAGE_KEYS.openaiKey);
    const fal = localStorage.getItem(STORAGE_KEYS.falKey);
    return {
      openaiKey: openai,
      falKey: fal,
      hasOpenAI: !!openai,
      hasFal: !!fal,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const openai = localStorage.getItem(STORAGE_KEYS.openaiKey);
    const fal = localStorage.getItem(STORAGE_KEYS.falKey);
    setKeys({
      openaiKey: openai,
      falKey: fal,
      hasOpenAI: !!openai,
      hasFal: !!fal,
    });
  }, []);

  const setOpenAIKey = (key: string) => {
    localStorage.setItem(STORAGE_KEYS.openaiKey, key);
    setKeys((prev) => ({ ...prev, openaiKey: key, hasOpenAI: true }));
  };

  const setFalKey = (key: string) => {
    localStorage.setItem(STORAGE_KEYS.falKey, key);
    setKeys((prev) => ({ ...prev, falKey: key, hasFal: true }));
  };

  const clearOpenAIKey = () => {
    localStorage.removeItem(STORAGE_KEYS.openaiKey);
    setKeys((prev) => ({ ...prev, openaiKey: null, hasOpenAI: false }));
  };

  const clearFalKey = () => {
    localStorage.removeItem(STORAGE_KEYS.falKey);
    setKeys((prev) => ({ ...prev, falKey: null, hasFal: false }));
  };

  return { ...keys, setOpenAIKey, setFalKey, clearOpenAIKey, clearFalKey };
}
