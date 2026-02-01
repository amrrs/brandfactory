import { AssetCounts } from "./types";

export const MAX_UPLOADS = 1;
export const MAX_PER_TYPE = 5;

export const DEFAULT_COUNTS: AssetCounts = {
  portrait: 2,
  portrait34: 1,
  square: 2,
  landscape: 1,
  video: 1,
  carousel: 0,
};

export const STORAGE_KEYS = {
  openaiKey: "brandfactory-openai-key",
  falKey: "brandfactory-fal-key",
  history: "brandfactory-history",
  prefs: "brandfactory-prefs",
};

export const OPENAI_MODELS = {
  analysis: "gpt-5.2",
  prompt: "gpt-5.2",
  copy: "gpt-5.2",
  image: "gpt-image-1.5",
  sora: "sora-2",
} as const;
