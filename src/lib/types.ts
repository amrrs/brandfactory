export type AspectRatio = "9:16" | "3:4" | "1:1" | "16:9";
export type AssetType = "image" | "video" | "carousel";
export type AssetStatus = "pending" | "generating" | "completed" | "failed";
export type AIProvider = "openai" | "fal";

// Carousel slide with optional text overlay
export interface CarouselSlide {
  id: string;
  imageUrl: string;
  prompt: string;
  slideType: "hook" | "problem" | "solution" | "proof" | "cta";
  textOverlay?: {
    headline?: string;
    body?: string;
    cta?: string;
    position: "top" | "center" | "bottom";
    textColor: string;
    fontSize: "sm" | "md" | "lg";
  };
}

export interface APIConfig {
  openai: {
    apiKey: string;
    isConfigured: boolean;
  };
  fal: {
    apiKey: string | null;
    isConfigured: boolean;
  };
}

export interface Asset {
  id: string;
  type: AssetType;
  aspectRatio: AspectRatio;
  status: AssetStatus;
  description: string;
  url: string;
  provider: AIProvider;
  error?: string;
  createdAt: number;
  sourceImageIndex?: number;
  // For carousel assets
  slides?: CarouselSlide[];
}

export interface HistoryItem extends Omit<Asset, "status" | "error"> {
  brandName?: string;
  thumbnail?: string;
  summary?: string;
  assetsCount?: number;
  adCopyHeadline?: string;
}

export interface ImageAttribute {
  index: number;
  viewAngle: "front" | "back" | "detail" | "side" | "other";
  description?: string;
}

export interface BrandAnalysis {
  colors: string[];
  mood: string;
  subject: string;
  personDescription?: string;
  brandName?: string;
  slogan?: string;
  hasLogo: boolean;
  industry?: string;
  imageAttributes?: ImageAttribute[];
}

export interface PlatformPrediction {
  platform: "Instagram" | "LinkedIn" | "Twitter/X" | "TikTok" | "Facebook";
  score: number; // 0-100
  reasoning: string;
}

export interface EngagementAnalysis {
  overallScore: number; // 0-100
  platformPredictions: PlatformPrediction[];
  strengths: string[];
  improvements: string[];
  keyInsights: string;
}

export interface TargetAudience {
  demographics: string; // "25-40 year old urban professionals"
  psychographics: string; // "Value innovation, quality, and sustainability"
  interests: string[]; // ["Technology", "Design", "Lifestyle"]
  painPoints: string[]; // ["Lack of time", "Need for convenience"]
  aspirations: string[]; // ["Career success", "Work-life balance"]
}

export interface SamplePost {
  platform: "Instagram" | "LinkedIn" | "Twitter/X" | "TikTok" | "Facebook";
  caption: string;
  hooks: string[]; // Opening lines that grab attention
  hashtags: string[];
  bestTime: string; // "Weekdays 9-11 AM"
}

export interface BrandStrategy {
  targetAudience: TargetAudience;
  brandArchetype: string; // "The Creator", "The Hero", etc.
  archetypeDescription: string;
  positioningStatement: string; // One-line brand positioning
  messagingPillars: string[]; // 3-4 core messaging themes
  contentThemes: string[]; // Recurring content ideas
  samplePosts: SamplePost[];
  competitiveAdvantage: string;
}

export interface CarouselSlideSpec {
  prompt: string;
  slideType: "hook" | "problem" | "solution" | "proof" | "cta";
  suggestedHeadline?: string;
  suggestedBody?: string;
}

export interface AssetSpecs {
  socialPrompts: string[];
  portrait34Prompts: string[];
  squarePrompts: string[];
  landscapePrompts: string[];
  videoPrompts: string[];
  carouselSlides?: CarouselSlideSpec[];
  socialImageIndices?: number[];
  portrait34ImageIndices?: number[];
  squareImageIndices?: number[];
  landscapeImageIndices?: number[];
  videoImageIndices?: number[];
}

export interface AssetCounts {
  portrait: number;
  portrait34: number;
  square: number;
  landscape: number;
  video: number;
  carousel: number;
}

export interface AdCopy {
  headline: string;
  tagline?: string;
  description: string;
  cta: string;
  hashtags: string[];
  instagramCaption?: string;
  facebookCaption?: string;
  twitterCaption?: string;
  linkedinCaption?: string;
  tiktokCaption?: string;
}

export interface AppState {
  uploadedImages: File[];
  previewUrls: string[];
  userInstruction: string;
  assetCounts: AssetCounts;
  currentPhase: "idle" | "uploading" | "analyzing" | "generating" | "completed";
  progress: number;
  progressMessage: string;
  isProcessing: boolean;
  brandContext: BrandAnalysis | null;
  generatedAssets: Asset[];
  adCopy: AdCopy | null;
  uploadedSourceUrls: string[];
  history: HistoryItem[];
  error: string | null;
  showHistory: boolean;
  showSingleAssetDialog: boolean;
  showAdCopyDialog: boolean;
}
