import OpenAI from "openai";
import { fal } from "@fal-ai/client";

export function getOpenAIClient(apiKey: string) {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export function getFalClient(apiKey: string) {
  fal.config({ credentials: apiKey });
  return fal;
}
