# BrandFactory - Project Details

## Project Summary (500 characters)

BrandFactory is an AI-powered creative asset generator built with Next.js 16 and TypeScript. It uses OpenAI's GPT-5.2 (reasoning + vision), GPT-Image-1.5, and Sora-2 to transform brand images into professional marketing assets. Features include multi-format asset generation (social, portrait, square, landscape, video, carousel), engagement prediction, and comprehensive brand strategy analysis. The architecture implements intelligent prompt engineering, structured outputs, and fallback mechanisms (fal.ai) for reliability. Built for scalability with modular services and React hooks.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BRANDFACTORY                              │
│                     Next.js 16 + TypeScript                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐       ┌───────▼────────┐
            │   Frontend     │       │   Services     │
            │   (React)      │       │   Layer        │
            └───────┬────────┘       └───────┬────────┘
                    │                        │
        ┌───────────┼────────────┐          │
        │           │            │          │
   ┌────▼────┐ ┌───▼────┐ ┌────▼────┐     │
   │ Upload  │ │ Asset  │ │ Analysis│     │
   │  Zone   │ │ Config │ │ Panels  │     │
   └─────────┘ └────────┘ └─────────┘     │
                                           │
                    ┌──────────────────────┘
                    │
        ┌───────────┼───────────┬──────────────┐
        │           │           │              │
   ┌────▼────┐ ┌───▼────┐ ┌───▼─────┐  ┌────▼────┐
   │   AI    │ │ Image  │ │  Video  │  │ Storage │
   │Analysis │ │  Gen   │ │   Gen   │  │ Service │
   └────┬────┘ └───┬────┘ └───┬─────┘  └─────────┘
        │          │          │
        └──────────┼──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼─────┐   ┌───▼─────┐   ┌───▼─────┐
│ OpenAI  │   │ OpenAI  │   │ OpenAI  │
│ GPT-5.2 │   │ GPT-Img │   │ Sora-2  │
└───┬─────┘   └───┬─────┘   └───┬─────┘
    │             │ (fail)      │ (fail)
    │         ┌───▼─────┐   ┌───▼─────┐
    │         │ fal.ai  │   │ fal.ai  │
    │         │GPT-Img  │   │ Sora-2  │
    │         └─────────┘   └─────────┘
    └─ No fallback (core feature)
```

---

## Application Flow

### 1. Asset Generation Flow

```
┌─────────────┐
│ User Upload │
│   Image(s)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  GPT-5.2 Vision: Analyze Brand Context  │
│  • Extract colors, mood, subject        │
│  • Detect logos, text, person details   │
│  • Identify industry & brand name       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ GPT-5.2 Reasoning: Generate Prompts     │
│  • Create photographer-quality prompts  │
│  • Preserve brand identity attributes   │
│  • Generate for each format:            │
│    - Social (9:16)                      │
│    - Portrait (3:4)                     │
│    - Square (1:1)                       │
│    - Landscape (16:9)                   │
│    - Video                              │
│    - Carousel (5 slides)                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Parallel Generation (by format)       │
│                                         │
│  ┌─────────────┐    ┌─────────────┐   │
│  │ GPT-Image   │    │   Sora-2    │   │
│  │    1.5      │    │   Video     │   │
│  └─────┬───────┘    └──────┬──────┘   │
│        │ (on fail)         │           │
│  ┌─────▼───────┐    ┌──────▼──────┐   │
│  │  fal.ai     │    │   fal.ai    │   │
│  │ GPT-Image   │    │   Sora-2    │   │
│  └─────────────┘    └─────────────┘   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GPT-5.2: Generate Ad Copy              │
│  • Headlines, body text, CTAs           │
│  • Customized per asset format          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Display Assets in Grid               │
│   • Preview, download, edit carousel   │
└─────────────────────────────────────────┘
```

### 2. Engagement Prediction Flow

```
┌─────────────┐
│ User Upload │
│Brand Asset  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Convert Image to Base64                  │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ GPT-5.2 Vision + Reasoning (high effort) │
│ • Analyze visual appeal & composition    │
│ • Evaluate brand messaging clarity       │
│ • Assess platform suitability            │
│ • Score: 0-100 overall engagement        │
│ • Platform scores (Instagram, LinkedIn,  │
│   Twitter/X, TikTok, Facebook)           │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Display Results                          │
│ • Gauge meter (overall score)            │
│ • Platform predictions with reasoning    │
│ • Strengths & improvement suggestions    │
└──────────────────────────────────────────┘
```

### 3. Brand Strategy Flow

```
┌─────────────┐
│ User Upload │
│Brand Image  │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Convert Image to Base64                  │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ GPT-5.2 Vision + Reasoning (high effort) │
│ Structured Output Tool Call:             │
│ • Target Audience Profiling              │
│   - Demographics, psychographics         │
│   - Interests, pain points, aspirations  │
│ • Brand Archetype Identification         │
│ • Positioning Statement                  │
│ • Messaging Pillars (3-4 core themes)    │
│ • Content Themes                         │
│ • Platform-Specific Sample Posts         │
│   - Caption, hooks, hashtags, timing     │
│ • Competitive Advantage                  │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Display Strategy Report                  │
│ • Interactive sections                   │
│ • Export to PDF (jsPDF)                  │
└──────────────────────────────────────────┘
```

---

## Technical Stack

### Frontend
```
Next.js 16 (App Router)
    │
    ├─ TypeScript 5 (Type Safety)
    ├─ Tailwind CSS 4 (Styling + Animations)
    ├─ React 19 (UI Components)
    └─ Custom Hooks (State Management)
        ├─ use-asset-generation.ts
        ├─ use-api-keys.ts
        ├─ use-history.ts
        └─ use-debug-logs.ts
```

### AI Services Layer
```
services/ai/
    │
    ├─ promptGeneration.ts
    │   └─ GPT-5.2 with reasoning + structured outputs
    │
    ├─ imageAnalysis.ts
    │   └─ GPT-5.2 vision with strict schema validation
    │
    ├─ adCopyGeneration.ts
    │   └─ GPT-5.2 with tool calling
    │
    ├─ engagementAnalysis.ts
    │   └─ GPT-5.2 vision + reasoning (high effort)
    │
    ├─ brandStrategyAnalysis.ts
    │   └─ GPT-5.2 vision + reasoning (high effort)
    │
    ├─ imageGeneration.ts
    │   └─ GPT-Image-1.5 → fallback: fal.ai GPT-Image-1.5
    │
    └─ videoGeneration.ts
        └─ Sora-2 → fallback: fal.ai Sora-2
```

### Key Dependencies
- `openai` v6.17+ - Official OpenAI SDK
- `@fal-ai/client` v1.8+ - Fallback image/video generation
- `jspdf` v4.0+ - PDF export for brand strategy
- `lucide-react` - Icon library
- `canvas-confetti` - Celebration animations

---

## Fallback Architecture

### Image Generation Fallback
```
┌────────────────┐
│ Generate Image │
└────────┬───────┘
         │
         ▼
    ┌────────────────────┐
    │ Try OpenAI         │
    │ GPT-Image-1.5      │
    └────┬──────┬────────┘
         │      │
    Success   Fail/Rate Limit
         │      │
         ▼      ▼
    Return  ┌────────────────┐
    Image   │ Try fal.ai     │
            │ GPT-Image-1.5  │
            └────┬──────┬────┘
                 │      │
            Success   Fail
                 │      │
                 ▼      ▼
            Return   Throw
            Image    Error
```

### Why Fallback?
- **Reliability**: Ensures assets are always generated
- **Rate Limits**: OpenAI rate limits bypass
- **Cost Management**: Fallback if quota exceeded
- **Model Parity**: Both use compatible models (GPT-Image, Sora-2)

---

## Data Flow

### State Management
```
┌──────────────────┐
│   Local Storage  │
│                  │
│ • API Keys       │
│ • History        │
│ • Preferences    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│   React State (page.tsx)     │
│                              │
│ • uploadedImages: File[]     │
│ • previewUrls: string[]      │
│ • brandContext: BrandContext │
│ • assets: Asset[]            │
│ • activeTab: TabType         │
│ • engagementAnalysis         │
│ • brandStrategy              │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌─────────┐
│  Hooks  │  │Services │
└─────────┘  └─────────┘
```

### Type Safety Flow
```
lib/types.ts (Central Types)
    │
    ├─ BrandContext
    ├─ Asset (Image/Video/Carousel)
    ├─ EngagementAnalysis
    ├─ BrandStrategy
    ├─ AssetCounts
    └─ AIProvider
           │
           ▼
    Components + Services
    (Strict TypeScript enforcement)
```

---

## Key Features

### 1. Structured Outputs with Schema Validation
```typescript
// Example: Strict mode tool definition
const brandStrategyTool = {
  type: "function" as const,
  name: "analyze_brand_strategy",
  strict: true,  // Enforces exact schema
  parameters: {
    type: "object",
    properties: { /* ... */ },
    required: [/* all properties */],
    additionalProperties: false  // No extra fields
  }
}
```

### 2. Reasoning with High Effort
```typescript
const response = await openai.responses.create({
  model: "gpt-5.2",
  reasoning: { effort: "high" },  // Extended thinking
  // ...
});
```

### 3. Vision with High Detail
```typescript
{
  type: "input_image",
  image_url: base64DataUrl,
  detail: "high"  // Maximum visual analysis
}
```

### 4. Parallel Asset Generation
- Multiple formats generated simultaneously
- Progress tracking per asset type
- Individual error handling (fails don't block others)

---

## Performance Optimizations

1. **Parallel API Calls**: Multiple assets generated concurrently
2. **Client-Side Caching**: LocalStorage for API keys and history
3. **Lazy Loading**: Components loaded on-demand
4. **Optimistic UI**: Immediate feedback before API responses
5. **Blob URLs**: Efficient image preview without re-fetching

---

## Error Handling

```
API Call → Try OpenAI
              │
         ┌────┴────┐
       Success   Error
         │         │
      Return   Log Error
      Data       │
              Fallback?
                 │
            ┌────┴────┐
          Yes        No
            │         │
      Try fal.ai   Show User
            │        Error
       ┌────┴────┐
     Success   Fail
       │         │
    Return    Show Both
    Data      Errors
```

---

## Security

- API keys stored client-side only (localStorage)
- No server-side persistence of keys
- All API calls from client to OpenAI/fal.ai directly
- No middleware proxy (direct API communication)

---

## Future Scalability

The modular architecture supports easy addition of:
- New AI models (drop-in replacements in constants.ts)
- Additional asset formats (extend AssetConfig)
- More analysis features (new services in ai/)
- Alternative fallback providers (modify generation services)
