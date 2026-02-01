import { OPENAI_MODELS } from "@/lib/constants";
import { AdCopy, BrandAnalysis } from "@/lib/types";
import { getOpenAIClient } from "./index";

export async function generateAdCopy(
  apiKey: string,
  brandContext: BrandAnalysis,
  userInstruction?: string
): Promise<AdCopy> {
  const openai = getOpenAIClient(apiKey);

  const systemPrompt = `You are an expert advertising copywriter with 20+ years of experience.
You write compelling, conversion-focused copy that resonates with target audiences.
Your copy is always brand-aligned, platform-appropriate, and action-oriented.`;

  const userPrompt = `Create advertising copy for this brand:

Brand: ${brandContext.brandName || "Premium Brand"}
Product/Subject: ${brandContext.subject}
Brand Mood: ${brandContext.mood}
Brand Colors: ${brandContext.colors.join(", ")}
Industry: ${brandContext.industry || "Lifestyle"}
${userInstruction ? `\nSpecial Instructions: ${userInstruction}` : ""}

Generate JSON with:
headline (max 10 words), tagline, description (2-3 sentences), cta,
hashtags (5-8), instagramCaption, facebookCaption, twitterCaption,
linkedinCaption, tiktokCaption.`;

  // Use GPT-5.2 with responses API for better reasoning
  const response = await openai.responses.create({
    model: OPENAI_MODELS.copy,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: { type: "json_object" }
    },
    reasoning: {
      effort: "low" // Quick for straightforward copywriting
    },
    store: true,
  });

  // Extract text output from response
  const textOutput = response.output?.find(
    (item: { type: string }) => item.type === "message"
  );
  const jsonText = textOutput?.content?.[0]?.text ?? "{}";
  return JSON.parse(jsonText) as AdCopy;
}
