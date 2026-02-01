import { OPENAI_MODELS } from "@/lib/constants";
import { EngagementAnalysis, PlatformPrediction } from "@/lib/types";
import { getOpenAIClient } from "./index";

// Tool definition for engagement analysis
const engagementAnalysisTool = {
  type: "function" as const,
  name: "analyze_engagement_potential",
  description:
    "Analyzes an image asset to predict engagement potential across different social media platforms and provides actionable insights.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      overallScore: {
        type: "number",
        description: "Overall engagement potential score from 0-100, considering visual appeal, clarity, emotional impact, and brand consistency.",
      },
      platformScores: {
        type: "object",
        properties: {
          instagram: { type: "number", description: "Engagement score for Instagram (0-100)" },
          linkedin: { type: "number", description: "Engagement score for LinkedIn (0-100)" },
          twitter: { type: "number", description: "Engagement score for Twitter/X (0-100)" },
          tiktok: { type: "number", description: "Engagement score for TikTok (0-100)" },
          facebook: { type: "number", description: "Engagement score for Facebook (0-100)" },
        },
        required: ["instagram", "linkedin", "twitter", "tiktok", "facebook"],
        additionalProperties: false,
      },
      platformReasonings: {
        type: "object",
        properties: {
          instagram: { type: "string", description: "Why this score for Instagram" },
          linkedin: { type: "string", description: "Why this score for LinkedIn" },
          twitter: { type: "string", description: "Why this score for Twitter/X" },
          tiktok: { type: "string", description: "Why this score for TikTok" },
          facebook: { type: "string", description: "Why this score for Facebook" },
        },
        required: ["instagram", "linkedin", "twitter", "tiktok", "facebook"],
        additionalProperties: false,
      },
      strengths: {
        type: "array",
        items: { type: "string" },
        description: "3-5 key strengths of this asset (e.g., 'High contrast catches attention', 'Clear product focus', 'Emotional storytelling')",
      },
      improvements: {
        type: "array",
        items: { type: "string" },
        description: "2-4 actionable improvements (e.g., 'Add text overlay for context', 'Increase brightness by 10%', 'Include human element')",
      },
      keyInsights: {
        type: "string",
        description: "One concise sentence summarizing the asset's engagement potential and best use case.",
      },
    },
    required: ["overallScore", "platformScores", "platformReasonings", "strengths", "improvements", "keyInsights"],
    additionalProperties: false,
  },
};

export async function analyzeEngagement(
  apiKey: string,
  imageUrl: string
): Promise<EngagementAnalysis> {
  const openai = getOpenAIClient(apiKey);

  const systemPrompt = `You are a social media engagement expert with deep knowledge of platform algorithms, user behavior, and visual content performance.

SCORING CRITERIA (0-100):
- **90-100**: Viral potential, exceptional visual appeal, perfect for platform
- **75-89**: High engagement likely, strong visual/emotional impact
- **60-74**: Good performance expected, solid content
- **40-59**: Average performance, needs optimization
- **0-39**: Low engagement likely, significant improvements needed

PLATFORM CHARACTERISTICS:
**Instagram**: Aesthetic appeal, lifestyle imagery, bright colors, aspirational content, faces/people perform well
**LinkedIn**: Professional imagery, clear messaging, educational/inspirational, business context, thought leadership
**Twitter/X**: Bold statements, controversy/emotion, quick visual impact, memes/trends, text-friendly
**TikTok**: Dynamic/energetic, authentic/raw, trend-aligned, youth appeal, behind-the-scenes
**Facebook**: Relatable/nostalgic, community-focused, family-friendly, longer-form storytelling

Consider:
- Visual composition (rule of thirds, balance, focal point)
- Color psychology and contrast
- Emotional resonance
- Clarity and simplicity
- Text readability (if present)
- Brand consistency
- Platform-specific best practices`;

  const response = await openai.responses.create({
    model: OPENAI_MODELS.analysis,
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Analyze this image asset for engagement potential across social media platforms. Provide scores, reasoning, strengths, improvements, and key insights.",
          },
          {
            type: "input_image",
            image_url: imageUrl,
            detail: "high" as const,
          },
        ],
      },
    ],
    reasoning: {
      effort: "high", // Higher reasoning for nuanced analysis
    },
    tools: [engagementAnalysisTool],
    tool_choice: "required",
    store: true,
  });

  const toolCall = response.output?.find(
    (item: { type: string }) => item.type === "function_call"
  );
  if (!toolCall || toolCall.type !== "function_call") {
    throw new Error("No engagement analysis returned");
  }

  const result = JSON.parse(toolCall.arguments);

  // Transform to our type structure
  const platformPredictions: PlatformPrediction[] = [
    { platform: "Instagram", score: result.platformScores.instagram, reasoning: result.platformReasonings.instagram },
    { platform: "LinkedIn", score: result.platformScores.linkedin, reasoning: result.platformReasonings.linkedin },
    { platform: "Twitter/X", score: result.platformScores.twitter, reasoning: result.platformReasonings.twitter },
    { platform: "TikTok", score: result.platformScores.tiktok, reasoning: result.platformReasonings.tiktok },
    { platform: "Facebook", score: result.platformScores.facebook, reasoning: result.platformReasonings.facebook },
  ];

  // Sort by score descending
  platformPredictions.sort((a, b) => b.score - a.score);

  return {
    overallScore: result.overallScore,
    platformPredictions,
    strengths: result.strengths,
    improvements: result.improvements,
    keyInsights: result.keyInsights,
  };
}
