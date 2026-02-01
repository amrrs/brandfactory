import { OPENAI_MODELS } from "@/lib/constants";
import { AIProvider } from "@/lib/types";
import { getOpenAIClient, getFalClient } from "./index";

export interface VideoGenerationOptions {
  prompt: string;
  sourceImageUrl: string;
  duration?: number;
  aspectRatio?: "16:9" | "9:16" | "1:1";
}

export async function generateVideoWithOpenAI(
  apiKey: string,
  options: VideoGenerationOptions
): Promise<string> {
  const openai = getOpenAIClient(apiKey);
  const inputReference = await fetch(options.sourceImageUrl).then((r) => r.blob());

  const video = await openai.videos.create({
    model: OPENAI_MODELS.sora,
    prompt: options.prompt,
    size: "1280x720",
    seconds: (options.duration ?? 8) as any,
    input_reference: inputReference,
  });

  const completed = await pollVideoStatus(openai, video.id);
  if (completed.status !== "completed") {
    throw new Error(completed.error?.message ?? "Video generation failed");
  }

  const content = await openai.videos.downloadContent(completed.id);
  const buffer = await content.arrayBuffer();
  const blob = new Blob([buffer], { type: "video/mp4" });
  return URL.createObjectURL(blob);
}

async function pollVideoStatus(
  openai: ReturnType<typeof getOpenAIClient>,
  videoId: string
): Promise<{ id: string; status: string; error?: { message: string } }> {
  const maxAttempts = 120;
  const pollInterval = 10000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await openai.videos.retrieve(videoId);
    if (status.status === "completed" || status.status === "failed") {
      return status as any;
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  throw new Error("Video generation timed out");
}

export async function generateVideoWithFal(
  falKey: string,
  options: VideoGenerationOptions
): Promise<string> {
  const fal = getFalClient(falKey);

  try {
    const result = await fal.subscribe("fal-ai/sora-2/image-to-video", {
      input: {
        prompt: options.prompt,
        image_url: options.sourceImageUrl,
        duration: (options.duration ?? 8) as any,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Video progress:", update.logs);
        }
      },
    });

    const videoUrl = (result as any).video?.url || (result as any).data?.video?.url || (result as any).url;
    if (!videoUrl) {
      throw new Error(`No video returned. Raw result: ${safeStringify(result)}`);
    }

    return videoUrl;
  } catch (error) {
    throw new Error(`fal video generation failed: ${formatError(error)}`);
  }
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return `${error.message}${error.stack ? `\n${error.stack}` : ""}`;
  }
  return safeStringify(error);
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export async function generateVideo(
  apiKey: string | null,
  falKey: string | null,
  options: VideoGenerationOptions
): Promise<{ url: string; provider: AIProvider }> {
  if (apiKey) {
    try {
      const url = await generateVideoWithOpenAI(apiKey, options);
      return { url, provider: "openai" };
    } catch (error) {
      console.warn("OpenAI video generation failed, trying fallback:", error);
    }
  }

  if (falKey) {
    const url = await generateVideoWithFal(falKey, options);
    return { url, provider: "fal" };
  }

  throw new Error("No AI service available for video generation");
}
