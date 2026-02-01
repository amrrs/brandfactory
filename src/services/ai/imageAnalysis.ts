import { OPENAI_MODELS } from "@/lib/constants";
import { BrandAnalysis, ImageAttribute } from "@/lib/types";
import { getOpenAIClient } from "./index";

// Tool definition for responses API (different format from chat completions)
const analyzeBrandTool = {
  type: "function" as const,
  name: "analyze_brand_identity",
  description:
    "Analyzes all images to extract brand identity and, for each image, its view angle and a short description. Use this to inform which image (front, back, detail, etc.) to use for each generated asset.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      colors: {
        type: "array",
        items: { type: "string" },
        description: "Simple color NAMES of dominant brand/product colors. Use plain English: 'red', 'dark brown', 'forest green', 'matte black', 'rose gold'. NO hex codes.",
      },
      mood: {
        type: "string",
        description:
          "The emotional tone (e.g., Energetic, Serene, Luxury, Minimalist).",
      },
      subject: {
        type: "string",
        description: "The main subject/product with SPECIFIC visual details: exact color (e.g., 'sage green iPhone', 'matte black headphones', 'rose gold watch'), material, finish. Be precise—this anchors all generated imagery.",
      },
      personDescription: {
        type: ["string", "null"],
        description: "If a person is present: their apparent skin tone, hair style/color, and any distinctive features. E.g., 'dark-skinned woman with natural coily hair' or 'East Asian man with short black hair and glasses'. Set to null if no person.",
      },
      brandName: {
        type: ["string", "null"],
        description: "Brand name if visible or inferable. Null if unknown.",
      },
      slogan: {
        type: ["string", "null"],
        description: "Suggested marketing slogan based on brand identity. Can be null.",
      },
      hasLogo: {
        type: "boolean",
        description: "Whether a distinct logo is visible in any image.",
      },
      industry: {
        type: ["string", "null"],
        description: "Industry vertical (Fashion, Tech, Food, Beauty, etc.). Null if unclear.",
      },
      imageAttributes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            index: { type: "number", description: "0-based image index." },
            viewAngle: {
              type: "string",
              enum: ["front", "back", "detail", "side", "other"],
              description: "View angle of this image (front product, back, detail close-up, side, other).",
            },
            description: {
              type: "string",
              description: "Short description (e.g. 'front product shot', 'back of package'). Can be empty string if no specific description.",
            },
          },
          required: ["index", "viewAngle", "description"],
          additionalProperties: false,
        },
        description:
          "For each image, its 0-based index, viewAngle (front|back|detail|side|other), and short description. Must have one entry per image.",
      },
    },
    required: ["colors", "mood", "subject", "imageAttributes", "personDescription", "brandName", "slogan", "hasLogo", "industry"],
    additionalProperties: false,
  },
};

export async function analyzeWithOpenAI(
  apiKey: string,
  imageBase64s: string[]
): Promise<BrandAnalysis> {
  const openai = getOpenAIClient(apiKey);
  if (!imageBase64s.length) {
    throw new Error("No images provided for analysis");
  }

  const imageParts = imageBase64s.map((imageBase64) => ({
    type: "input_image" as const,
    image_url: imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`,
  }));

  const response = await openai.responses.create({
    model: OPENAI_MODELS.analysis,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `You are given ${imageBase64s.length} images in order (index 0, 1, ...). 

Extract details that will be used to generate ad photography:

1. SUBJECT: Describe the product simply but specifically. "glass Coca-Cola bottle", "matte black headphones", "white Nike sneaker". Include color and material.

2. PERSON (if present): Describe appearance naturally. "woman with dark skin and natural curly hair", "man with light skin and beard".

3. COLORS: Use simple color names a photographer would say: "red", "dark brown", "cream white", "forest green". NO HEX CODES - just plain color words.

For each image, note its view angle (front, back, detail, side, other).

Call analyze_brand_identity.`,
          },
          ...imageParts,
        ],
      },
    ],
    reasoning: {
      effort: "medium" // Balanced reasoning for analysis
    },
    tools: [analyzeBrandTool],
    tool_choice: "required",
    store: true,
  });

  const toolCall = response.output?.find(
    (item: { type: string }) => item.type === "function_call"
  );
  if (!toolCall || toolCall.type !== "function_call") {
    throw new Error("No analysis returned");
  }
  return JSON.parse(toolCall.arguments) as BrandAnalysis;
}
