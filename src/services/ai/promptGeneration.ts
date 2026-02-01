import { OPENAI_MODELS } from "@/lib/constants";
import { AssetCounts, AssetSpecs, BrandAnalysis } from "@/lib/types";
import { getOpenAIClient } from "./index";

// Tool definition for responses API (different format from chat completions)
const creativeBriefTool = {
  type: "function" as const,
  name: "generate_creative_brief",
  description:
    "Generates creative prompts and assigns which source image (by index) to use for each prompt. imageIndices arrays must match prompt array lengths.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      socialPrompts: {
        type: "array",
        items: { type: "string" },
        description: "Prompts for 9:16 vertical social media assets (no text).",
      },
      portrait34Prompts: {
        type: "array",
        items: { type: "string" },
        description: "Prompts for 3:4 portrait format (no text).",
      },
      squarePrompts: {
        type: "array",
        items: { type: "string" },
        description: "Prompts for 1:1 square feed posts (no text).",
      },
      landscapePrompts: {
        type: "array",
        items: { type: "string" },
        description: "Prompts for 16:9 landscape images (no text).",
      },
      videoPrompts: {
        type: "array",
        items: { type: "string" },
        description:
          "Prompts for 16:9 cinematic video content, product-focused.",
      },
      carouselSlides: {
        type: "array",
        items: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Image generation prompt for this slide. MUST include generous negative space (top or bottom 40%) for text overlay." },
            slideType: { type: "string", enum: ["hook", "problem", "solution", "proof", "cta"], description: "Narrative role of this slide." },
            suggestedHeadline: { type: "string", description: "Short punchy headline (3-6 words) for text overlay." },
            suggestedBody: { type: ["string", "null"], description: "Optional supporting text (10-15 words max). Can be null if not needed." },
          },
          required: ["prompt", "slideType", "suggestedHeadline", "suggestedBody"],
          additionalProperties: false,
        },
        description: "5-slide carousel with narrative arc: hook → problem → solution → proof → cta. Each slide needs negative space for text overlay.",
      },
      socialImageIndices: {
        type: "array",
        items: { type: "number" },
        description:
          "Source image index (0-based) for each social prompt. Same length as socialPrompts.",
      },
      portrait34ImageIndices: {
        type: "array",
        items: { type: "number" },
        description:
          "Source image index for each portrait 3:4 prompt. Same length as portrait34Prompts.",
      },
      squareImageIndices: {
        type: "array",
        items: { type: "number" },
        description:
          "Source image index for each square prompt. Same length as squarePrompts.",
      },
      landscapeImageIndices: {
        type: "array",
        items: { type: "number" },
        description:
          "Source image index for each landscape prompt. Same length as landscapePrompts.",
      },
      videoImageIndices: {
        type: "array",
        items: { type: "number" },
        description:
          "Source image index for each video prompt. Same length as videoPrompts.",
      },
    },
    required: [
      "socialPrompts",
      "portrait34Prompts",
      "squarePrompts",
      "landscapePrompts",
      "videoPrompts",
      "carouselSlides",
      "socialImageIndices",
      "portrait34ImageIndices",
      "squareImageIndices",
      "landscapeImageIndices",
      "videoImageIndices",
    ],
    additionalProperties: false,
  },
};

export async function generateAssetSpecs(
  apiKey: string,
  brandContext: BrandAnalysis,
  userInstruction: string | undefined,
  counts: AssetCounts,
  _numSourceImages: number
): Promise<AssetSpecs> {
  const openai = getOpenAIClient(apiKey);

  const systemMessage = `You're a creative director at an ad agency. You'll receive context about a product, then write image prompts for a photo shoot.

YOUR JOB: Use the context as INSPIRATION to understand the product, then write YOUR OWN creative prompts. Don't just copy-paste the context data.

GOOD PROMPTS (narrative, descriptive, ~30-40 words):
"A high-fashion medium shot of a refreshing glass Coca-Cola bottle centered on a cool marble countertop. The composition uses depth with a blurred kitchen window in the background. Lighting: Soft morning light filtering through, creating a cozy breakfast atmosphere."
"A cinematic close-up of an iPhone 15 Pro held against a vibrant city skyline at sunset. The lighting is golden hour, reflecting off the titanium edges, with a shallow depth of field blurring the urban lights behind."
"A dynamic action shot of a white Nike sneaker splashing through a rain puddle on asphalt. The scene captures frozen water droplets in mid-air. Lighting: High-contrast cinematic lighting emphasizing the texture and motion."
"A serene lifestyle shot of a luxury leather watch resting on weathered driftwood on a sandy beach. The composition places the ocean softly blurred in the background. Lighting: Natural sunlight highlighting the leather texture and metallic details."

WHAT MAKES THESE GOOD:
- **Camera Angle & Shot Type**: "medium shot", "cinematic close-up", "dynamic action shot"
- **Composition & Depth**: "uses depth with...", "blurred background", "shallow depth of field"
- **Lighting Specifics**: "Rembrandt lighting", "golden hour", "high-contrast"
- **Narrative Context**: Describes the scene, not just the object.

VARY YOUR SHOTS:
- Different angles: overhead, eye-level, low angle, close-up, wide
- Different settings: studio, lifestyle, outdoor, abstract
- Different moods: clean minimal, warm cozy, dramatic, energetic

AVOID:
- Hex color codes (#FF0000) 
- Technical photography jargon
- Robotic descriptions
- Repeating the same setup
- Changing the product's core identity (logos, text, shape must stay identical)

CRITICAL:
- If the product has text/logos (e.g. "Coca-Cola"), mention them explicitly so the AI attempts to render them: "visible 'Coca-Cola' script logo".`;


  const userPrompt = `CONTEXT (use as inspiration, don't copy literally):
- Product: ${brandContext.subject || "product"}
- Vibe: ${brandContext.mood || "modern"}
- Industry: ${brandContext.industry || "lifestyle"}
${brandContext.personDescription ? `- Features a person: ${brandContext.personDescription}` : ""}

DELIVERABLES:
- ${counts.portrait} vertical images (9:16 for stories)
- ${counts.portrait34} portrait images (3:4)
- ${counts.square} square images (1:1 for feed)
- ${counts.landscape} landscape images (16:9)
- ${counts.video} video clips
${counts.carousel > 0 ? `- ${counts.carousel} carousel set (5 slides each with text space)` : ""}

${userInstruction ? `CLIENT NOTE: "${userInstruction}"` : ""}

Now write creative prompts for this shoot. Make each one visually distinct - vary the setting, angle, lighting, and mood. Use rich, narrative descriptions (~30-40 words) that specify camera angle, composition, and lighting. Include the product name/logo in the prompt if visible.`;

  // Use GPT-5.2 with responses API for better reasoning
  const response = await openai.responses.create({
    model: OPENAI_MODELS.prompt,
    input: [
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt },
    ],
    reasoning: {
      effort: "medium" // Balanced reasoning for creative tasks
    },
    tools: [creativeBriefTool],
    tool_choice: "required", // Force tool use
    store: true,
  });

  // Extract tool call from response output
  const toolCall = response.output?.find(
    (item: { type: string }) => item.type === "function_call"
  );
  if (!toolCall || toolCall.type !== "function_call") {
    throw new Error("No asset specs returned");
  }
  return JSON.parse(toolCall.arguments) as AssetSpecs;
}
