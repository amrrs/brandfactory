import { OPENAI_MODELS } from "@/lib/constants";
import { BrandStrategy } from "@/lib/types";
import { getOpenAIClient } from "./index";

// Tool definition for brand strategy analysis
const brandStrategyTool = {
  type: "function" as const,
  name: "analyze_brand_strategy",
  description:
    "Analyzes a brand image to create a comprehensive brand strategy including target audience, messaging, content themes, and sample posts.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      targetAudience: {
        type: "object",
        properties: {
          demographics: {
            type: "string",
            description: "Age range, gender, location, income level. E.g., '25-40 year old urban professionals, middle to upper income'",
          },
          psychographics: {
            type: "string",
            description: "Values, attitudes, lifestyle. E.g., 'Value innovation, quality, and sustainability; early adopters'",
          },
          interests: {
            type: "array",
            items: { type: "string" },
            description: "5-7 key interests. E.g., ['Technology', 'Design', 'Travel', 'Fitness']",
          },
          painPoints: {
            type: "array",
            items: { type: "string" },
            description: "3-5 problems this audience faces that the brand solves",
          },
          aspirations: {
            type: "array",
            items: { type: "string" },
            description: "3-5 goals or desires this audience has",
          },
        },
        required: ["demographics", "psychographics", "interests", "painPoints", "aspirations"],
        additionalProperties: false,
      },
      brandArchetype: {
        type: "string",
        enum: [
          "The Creator",
          "The Hero",
          "The Explorer",
          "The Sage",
          "The Rebel",
          "The Magician",
          "The Lover",
          "The Caregiver",
          "The Ruler",
          "The Innocent",
          "The Jester",
          "The Everyman",
        ],
        description: "Which of the 12 brand archetypes best fits this brand",
      },
      archetypeDescription: {
        type: "string",
        description: "2-3 sentences explaining why this archetype fits and what it means for the brand",
      },
      positioningStatement: {
        type: "string",
        description: "One powerful sentence positioning the brand. Format: 'For [target], [brand] is the [category] that [unique benefit] because [reason to believe]'",
      },
      messagingPillars: {
        type: "array",
        items: { type: "string" },
        description: "3-4 core messaging themes to repeat across all content (e.g., 'Innovation', 'Sustainability', 'Community')",
      },
      contentThemes: {
        type: "array",
        items: { type: "string" },
        description: "5-7 recurring content ideas (e.g., 'Behind the scenes', 'Customer stories', 'Product education')",
      },
      samplePosts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              enum: ["Instagram", "LinkedIn", "Twitter/X", "TikTok", "Facebook"],
            },
            caption: {
              type: "string",
              description: "Full post caption (150-300 chars for Twitter, 500+ for others)",
            },
            hooks: {
              type: "array",
              items: { type: "string" },
              description: "3 alternative opening lines to grab attention",
            },
            hashtags: {
              type: "array",
              items: { type: "string" },
              description: "5-10 relevant hashtags without the # symbol",
            },
            bestTime: {
              type: "string",
              description: "Best posting time for this platform and audience. E.g., 'Weekdays 9-11 AM EST'",
            },
          },
          required: ["platform", "caption", "hooks", "hashtags", "bestTime"],
          additionalProperties: false,
        },
        description: "5 sample posts (one for each major platform)",
      },
      competitiveAdvantage: {
        type: "string",
        description: "What makes this brand stand out from competitors in 2-3 sentences",
      },
    },
    required: [
      "targetAudience",
      "brandArchetype",
      "archetypeDescription",
      "positioningStatement",
      "messagingPillars",
      "contentThemes",
      "samplePosts",
      "competitiveAdvantage",
    ],
    additionalProperties: false,
  },
};

export async function analyzeBrandStrategy(
  apiKey: string,
  imageUrl: string
): Promise<BrandStrategy> {
  const openai = getOpenAIClient(apiKey);

  const systemPrompt = `You are a senior brand strategist with 20 years of experience building iconic brands across industries.

BRAND ARCHETYPES (choose the best fit):
1. **The Creator**: Innovation, imagination, self-expression (e.g., Apple, Adobe, LEGO)
2. **The Hero**: Courage, achievement, proving worth (e.g., Nike, FedEx, Duracell)
3. **The Explorer**: Freedom, discovery, adventure (e.g., Jeep, Patagonia, Red Bull)
4. **The Sage**: Knowledge, truth, wisdom (e.g., Google, PBS, The Economist)
5. **The Rebel**: Revolution, disruption, liberation (e.g., Harley-Davidson, Virgin, Diesel)
6. **The Magician**: Transformation, vision, making dreams come true (e.g., Disney, Tesla, MasterCard)
7. **The Lover**: Intimacy, beauty, sensuality (e.g., Chanel, Godiva, Victoria's Secret)
8. **The Caregiver**: Service, compassion, nurturing (e.g., Johnson & Johnson, UNICEF, Volvo)
9. **The Ruler**: Control, leadership, power (e.g., Mercedes-Benz, Rolex, Microsoft)
10. **The Innocent**: Optimism, simplicity, purity (e.g., Dove, Coca-Cola, Aveeno)
11. **The Jester**: Joy, fun, living in the moment (e.g., Old Spice, M&M's, Dollar Shave Club)
12. **The Everyman**: Belonging, connection, authenticity (e.g., IKEA, Target, Budweiser)

YOUR TASK:
Analyze the brand image deeply. Look beyond surface aesthetics to understand:
- Who is this brand FOR? (be specific with demographics & psychographics)
- What emotional territory does it own?
- What archetype naturally emerges?
- What makes it different/better?

Create actionable, specific recommendations. Avoid generic advice.`;

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
            text: "Analyze this brand image to create a comprehensive brand strategy. Include target audience profile, brand archetype, messaging pillars, content themes, and platform-specific sample posts with hooks and hashtags.",
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
      effort: "high", // High reasoning for strategic analysis
    },
    tools: [brandStrategyTool],
    tool_choice: "required",
    store: true,
  });

  const toolCall = response.output?.find(
    (item: { type: string }) => item.type === "function_call"
  );
  if (!toolCall || toolCall.type !== "function_call") {
    throw new Error("No brand strategy returned");
  }

  return JSON.parse(toolCall.arguments) as BrandStrategy;
}
