import { OPENAI_MODELS } from "@/lib/constants";
import { AspectRatio, AIProvider } from "@/lib/types";
import { base64ToBlobUrl } from "@/lib/utils";
import { getOpenAIClient, getFalClient } from "./index";

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio: AspectRatio;
  referenceImageUrls?: string[];
  quality?: "low" | "medium" | "high";
}

const sizeMap: Record<AspectRatio, "1024x1024" | "1024x1536" | "1536x1024"> =
  {
    "9:16": "1024x1536",
    "3:4": "1024x1536",
    "1:1": "1024x1024",
    "16:9": "1536x1024",
  };

export async function generateImageWithOpenAI(
  apiKey: string,
  options: ImageGenerationOptions
): Promise<string> {
  const openai = getOpenAIClient(apiKey);

  // Pass the prompt directly - creative direction is already in the prompt
  // Only add "no text" as a technical requirement
  const prompt = `${options.prompt}. No text, no words, no typography.`;

  try {
    if (options.referenceImageUrls && options.referenceImageUrls.length > 0) {
      const imageBlobs = await Promise.all(
        options.referenceImageUrls.map((url) => fetch(url).then((r) => r.blob()))
      );

      const imageFiles = imageBlobs.map(
        (blob, idx) =>
          new File([blob], `reference-${idx}.png`, {
            type: blob.type || "image/png",
          })
      );

      const response = await openai.images.edit({
        model: OPENAI_MODELS.image,
        image: imageFiles,
        prompt,
        input_fidelity: "high",
      });

      const b64 = response.data[0].b64_json;
      if (!b64) throw new Error("No image returned");
      return base64ToBlobUrl(b64);
    }

    const response = await openai.images.generate({
      model: OPENAI_MODELS.image,
      prompt,
      size: sizeMap[options.aspectRatio],
      quality: options.quality ?? "high",
      n: 1,
    });

    const b64 = response.data[0].b64_json;
    if (!b64) throw new Error("No image returned");
    return base64ToBlobUrl(b64);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Limit 0") || message.includes("rate limit")) {
      throw new Error(
        "OpenAI rate limit reached. Add a payment method or increase limits, or configure fal.ai as a fallback."
      );
    }
    throw error;
  }
}

export async function generateImageWithFal(
  falKey: string,
  options: ImageGenerationOptions
): Promise<string> {
  const fal = getFalClient(falKey);

  // Pass prompt directly - no boilerplate
  const prompt = `${options.prompt}. No text, no words, no typography.`;

  const result = await fal.subscribe("fal-ai/gpt-image-1.5", {
    input: {
      prompt,
      image_size: sizeMap[options.aspectRatio],
      quality: options.quality ?? "high",
      output_format: "png",
      ...(options.referenceImageUrls?.length
        ? { image_urls: options.referenceImageUrls, input_fidelity: "high" }
        : {}),
    },
    logs: true,
  });

  const images = result.images || result.data?.images;
  if (!images?.[0]?.url) throw new Error("No image returned");

  return images[0].url;
}

export async function generateImage(
  apiKey: string | null,
  falKey: string | null,
  options: ImageGenerationOptions
): Promise<{ url: string; provider: AIProvider }> {
  let openaiError: unknown = null;
  if (apiKey) {
    try {
      const url = await generateImageWithOpenAI(apiKey, options);
      return { url, provider: "openai" };
    } catch (error) {
      openaiError = error;
      console.warn("OpenAI image generation failed, trying fallback:", error);
    }
  }

  if (falKey) {
    const url = await generateImageWithFal(falKey, options);
    return { url, provider: "fal" };
  }

  if (openaiError instanceof Error) {
    throw new Error(`OpenAI image generation failed: ${openaiError.message}`);
  }

  throw new Error("No AI service available for image generation");
}
