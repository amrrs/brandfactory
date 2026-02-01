import { useCallback, useMemo, useReducer } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { DEFAULT_COUNTS, MAX_PER_TYPE } from "@/lib/constants";
import {
  AdCopy,
  AppState,
  Asset,
  AssetCounts,
  AssetSpecs,
  AssetType,
  AspectRatio,
  BrandAnalysis,
  CarouselSlide,
} from "@/lib/types";
import { clamp, uuid } from "@/lib/utils";
import { uploadImages } from "@/services/storage/imageUpload";
import { analyzeWithOpenAI } from "@/services/ai/imageAnalysis";
import { generateAssetSpecs } from "@/services/ai/promptGeneration";
import { generateImage } from "@/services/ai/imageGeneration";
import { generateVideo } from "@/services/ai/videoGeneration";
import { generateAdCopy } from "@/services/ai/adCopyGeneration";

type Action =
  | { type: "SET_IMAGES"; files: File[]; previews: string[] }
  | { type: "REMOVE_IMAGE"; index: number }
  | { type: "SET_INSTRUCTION"; instruction: string }
  | { type: "SET_COUNTS"; counts: AssetCounts }
  | { type: "SET_PHASE"; phase: AppState["currentPhase"]; message: string }
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "SET_UPLOADED_URLS"; urls: string[] }
  | { type: "SET_BRAND_CONTEXT"; context: BrandAnalysis }
  | { type: "SET_ASSETS"; assets: Asset[] }
  | { type: "UPDATE_ASSET"; asset: Asset }
  | { type: "SET_AD_COPY"; adCopy: AdCopy }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

const initialState: AppState = {
  uploadedImages: [],
  previewUrls: [],
  userInstruction: "",
  assetCounts: DEFAULT_COUNTS,
  currentPhase: "idle",
  progress: 0,
  progressMessage: "",
  isProcessing: false,
  brandContext: null,
  generatedAssets: [],
  adCopy: null,
  uploadedSourceUrls: [],
  history: [],
  error: null,
  showHistory: false,
  showSingleAssetDialog: false,
  showAdCopyDialog: false,
};

function assetReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_IMAGES":
      return {
        ...state,
        uploadedImages: action.files,
        previewUrls: action.previews,
      };
    case "REMOVE_IMAGE": {
      const files = state.uploadedImages.filter((_, i) => i !== action.index);
      const previews = state.previewUrls.filter((_, i) => i !== action.index);
      return { ...state, uploadedImages: files, previewUrls: previews };
    }
    case "SET_INSTRUCTION":
      return { ...state, userInstruction: action.instruction };
    case "SET_COUNTS":
      return { ...state, assetCounts: action.counts };
    case "SET_PHASE":
      return {
        ...state,
        currentPhase: action.phase,
        progressMessage: action.message,
        isProcessing: action.phase !== "idle" && action.phase !== "completed",
      };
    case "SET_PROGRESS":
      return { ...state, progress: action.progress };
    case "SET_UPLOADED_URLS":
      return { ...state, uploadedSourceUrls: action.urls };
    case "SET_BRAND_CONTEXT":
      return { ...state, brandContext: action.context };
    case "SET_ASSETS":
      return { ...state, generatedAssets: action.assets };
    case "UPDATE_ASSET":
      return {
        ...state,
        generatedAssets: state.generatedAssets.map((asset) =>
          asset.id === action.asset.id ? action.asset : asset
        ),
      };
    case "SET_AD_COPY":
      return { ...state, adCopy: action.adCopy };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "RESET":
      return { ...initialState, assetCounts: state.assetCounts };
    default:
      return state;
  }
}

export function useAssetGeneration(
  openaiKey: string | null,
  falKey: string | null,
  onLog: (message: string, level?: "info" | "error") => void = () => {}
) {
  const [state, dispatch] = useReducer(assetReducer, initialState);

  const uploadImagesAction = useCallback((files: File[]) => {
    const previews = files.map((file) => URL.createObjectURL(file));
    dispatch({ type: "SET_IMAGES", files, previews });
  }, []);

  const removeImage = useCallback((index: number) => {
    dispatch({ type: "REMOVE_IMAGE", index });
  }, []);

  const setInstruction = useCallback((instruction: string) => {
    dispatch({ type: "SET_INSTRUCTION", instruction });
  }, []);

  const setAssetCounts = useCallback((counts: AssetCounts) => {
    dispatch({ type: "SET_COUNTS", counts });
  }, []);

  const generate = useCallback(async () => {
    if (!openaiKey) {
      dispatch({ type: "SET_ERROR", error: "OpenAI API key is required." });
      onLog("OpenAI API key missing.", "error");
      return;
    }
    if (state.uploadedImages.length === 0) {
      dispatch({ type: "SET_ERROR", error: "Upload at least one image." });
      onLog("Generate blocked: no uploaded images.", "error");
      return;
    }
    if (
      Object.values(state.assetCounts).reduce((sum, v) => sum + v, 0) === 0
    ) {
      dispatch({ type: "SET_ERROR", error: "Select at least one asset." });
      onLog("Generate blocked: all counts set to 0.", "error");
      return;
    }

    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SET_PHASE", phase: "uploading", message: "Uploading images..." });
    dispatch({ type: "SET_PROGRESS", progress: 5 });
    onLog("Uploading images...");

    const uploadedUrls = await uploadImages(state.uploadedImages);
    dispatch({ type: "SET_UPLOADED_URLS", urls: uploadedUrls });
    onLog(`Uploaded ${uploadedUrls.length} images.`);

    dispatch({ type: "SET_PHASE", phase: "analyzing", message: "Analyzing brand..." });
    dispatch({ type: "SET_PROGRESS", progress: 15 });
    onLog("Analyzing brand context...");
    const brandContext = await analyzeWithOpenAI(openaiKey, uploadedUrls);
    dispatch({ type: "SET_BRAND_CONTEXT", context: brandContext });
    onLog("Brand analysis complete.");

    dispatch({ type: "SET_PHASE", phase: "generating", message: "Generating prompts..." });
    dispatch({ type: "SET_PROGRESS", progress: 25 });
    onLog("Generating creative prompts...");
    const specs = await generateAssetSpecs(
      openaiKey,
      brandContext,
      state.userInstruction,
      state.assetCounts,
      uploadedUrls.length
    );
    onLog("Prompt generation complete.");

    dispatch({ type: "SET_PHASE", phase: "generating", message: "Creating assets..." });
    const assets = buildInitialAssets(specs, state.assetCounts);
    dispatch({ type: "SET_ASSETS", assets });
    onLog(`Creating ${assets.length} assets...`);

    await generateAllAssets({
      assets,
      uploadedUrls,
      openaiKey,
      falKey,
      onProgress: (p) => dispatch({ type: "SET_PROGRESS", progress: p }),
      onAssetUpdate: (asset) => dispatch({ type: "UPDATE_ASSET", asset }),
      onError: (message) => {
        dispatch({ type: "SET_ERROR", error: message });
        onLog(message, "error");
      },
      onLog,
    });

    dispatch({ type: "SET_PHASE", phase: "generating", message: "Generating ad copy..." });
    dispatch({ type: "SET_PROGRESS", progress: 90 });
    onLog("Generating ad copy...");
    const adCopy = await generateAdCopy(openaiKey, brandContext, state.userInstruction);
    dispatch({ type: "SET_AD_COPY", adCopy });
    onLog("Ad copy generation complete.");

    dispatch({ type: "SET_PROGRESS", progress: 100 });
    dispatch({ type: "SET_PHASE", phase: "completed", message: "All assets generated." });
  }, [
    falKey,
    onLog,
    openaiKey,
    state.assetCounts,
    state.uploadedImages,
    state.userInstruction,
  ]);

  const generateSingleAsset = useCallback(
    async (type: AssetType, aspectRatio: AspectRatio, instruction?: string) => {
      if (!openaiKey) {
        onLog("Generate single asset blocked: missing OpenAI key.", "error");
        return;
      }
      if (
        type === "video" &&
        !state.uploadedSourceUrls[0] &&
        !state.previewUrls[0]
      ) {
        dispatch({ type: "SET_ERROR", error: "Upload a source image first." });
        onLog("Generate video blocked: no source image.", "error");
        return;
      }
      const prompt = instruction || "Create a high-end product image.";
      const asset: Asset = {
        id: uuid(),
        type,
        aspectRatio,
        status: "generating",
        description: prompt,
        url: "",
        provider: "openai",
        createdAt: Date.now(),
      };
      dispatch({ type: "SET_ASSETS", assets: [asset, ...state.generatedAssets] });

      const generator =
        type === "image"
          ? generateImage(openaiKey, falKey, {
              prompt,
              aspectRatio,
              referenceImageUrls:
                state.uploadedSourceUrls.length > 0
                  ? state.uploadedSourceUrls
                  : state.previewUrls,
              quality: "high",
            })
          : generateVideo(openaiKey, falKey, {
              prompt,
              sourceImageUrl:
                state.uploadedSourceUrls[0] ?? state.previewUrls[0] ?? "",
              duration: 8,
              aspectRatio: "16:9",
            });

      const result = await generator;
      dispatch({
        type: "UPDATE_ASSET",
        asset: { ...asset, status: "completed", url: result.url, provider: result.provider },
      });
      onLog(`Asset generated (${type} ${aspectRatio}) via ${result.provider}.`);
    },
    [falKey, onLog, openaiKey, state.generatedAssets, state.previewUrls, state.uploadedSourceUrls]
  );

  const generateVariant = useCallback(
    async (sourceAsset: Asset, type: AssetType, aspectRatio: AspectRatio) => {
      onLog(`Generating variant for ${type} ${aspectRatio}...`);
      return generateSingleAsset(type, aspectRatio, sourceAsset.description);
    },
    [generateSingleAsset, onLog]
  );

  const regenerateAdCopy = useCallback(
    async (instruction?: string) => {
      if (!openaiKey || !state.brandContext) return;
      const adCopy = await generateAdCopy(
        openaiKey,
        state.brandContext,
        instruction ?? state.userInstruction
      );
      dispatch({ type: "SET_AD_COPY", adCopy });
      onLog("Ad copy regenerated.");
    },
    [onLog, openaiKey, state.brandContext, state.userInstruction]
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const downloadAsset = useCallback(async (asset: Asset) => {
    if (!asset.url) return;
    const response = await fetch(asset.url);
    const blob = await response.blob();
    saveAs(blob, `${asset.type}-${asset.aspectRatio}-${asset.id}.${blob.type.includes("video") ? "mp4" : "png"}`);
    onLog(`Downloaded ${asset.type} ${asset.aspectRatio}.`);
  }, [onLog]);

  const downloadAll = useCallback(async () => {
    const zip = new JSZip();
    const assets = state.generatedAssets.filter((asset) => asset.status === "completed");
    await Promise.all(
      assets.map(async (asset) => {
        if (!asset.url) return;
        const response = await fetch(asset.url);
        const blob = await response.blob();
        const ext = blob.type.includes("video") ? "mp4" : "png";
        zip.file(`${asset.type}-${asset.aspectRatio}-${asset.id}.${ext}`, blob);
      })
    );
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "brandfactory-assets.zip");
    onLog(`Downloaded ZIP with ${assets.length} assets.`);
  }, [onLog, state.generatedAssets]);

  const api = useMemo(
    () => ({
      state,
      uploadImages: uploadImagesAction,
      removeImage,
      setInstruction,
      setAssetCounts,
      generate,
      generateSingleAsset,
      generateVariant,
      regenerateAdCopy,
      reset,
      downloadAsset,
      downloadAll,
    }),
    [
      downloadAll,
      downloadAsset,
      generate,
      generateSingleAsset,
      generateVariant,
      regenerateAdCopy,
      removeImage,
      reset,
      setAssetCounts,
      setInstruction,
      state,
      uploadImagesAction,
    ]
  );

  return api;
}

function buildInitialAssets(specs: AssetSpecs, counts: AssetCounts): Asset[] {
  const assets: Asset[] = [];
  const addAssets = (
    prompts: string[],
    indices: number[] | undefined,
    type: AssetType,
    aspectRatio: AspectRatio
  ) => {
    prompts.slice(0, MAX_PER_TYPE).forEach((prompt, i) => {
      const sourceImageIndex =
        indices != null && indices[i] !== undefined ? indices[i] : undefined;
      assets.push({
        id: uuid(),
        type,
        aspectRatio,
        status: "pending",
        description: prompt,
        url: "",
        provider: "openai",
        createdAt: Date.now(),
        sourceImageIndex,
      });
    });
  };

  addAssets(
    specs.socialPrompts || [],
    specs.socialImageIndices,
    "image",
    "9:16"
  );
  addAssets(
    specs.portrait34Prompts || [],
    specs.portrait34ImageIndices,
    "image",
    "3:4"
  );
  addAssets(specs.squarePrompts || [], specs.squareImageIndices, "image", "1:1");
  addAssets(
    specs.landscapePrompts || [],
    specs.landscapeImageIndices,
    "image",
    "16:9"
  );
  addAssets(
    specs.videoPrompts || [],
    specs.videoImageIndices,
    "video",
    "16:9"
  );

  // Add carousel assets (only if user requested them)
  if (counts.carousel > 0 && specs.carouselSlides && specs.carouselSlides.length > 0) {
    // Group slides into carousels of 5
    const slidesPerCarousel = 5;
    for (let i = 0; i < specs.carouselSlides.length; i += slidesPerCarousel) {
      const carouselSlides = specs.carouselSlides.slice(i, i + slidesPerCarousel);
      const slides: CarouselSlide[] = carouselSlides.map((spec, idx) => ({
        id: uuid(),
        imageUrl: "", // Will be filled during generation
        prompt: spec.prompt,
        slideType: spec.slideType,
        textOverlay: {
          headline: spec.suggestedHeadline || "",
          body: spec.suggestedBody || "",
          position: "bottom" as const,
          textColor: "#ffffff",
          fontSize: "md" as const,
        },
      }));

      assets.push({
        id: uuid(),
        type: "carousel",
        aspectRatio: "1:1",
        status: "pending",
        description: `Carousel: ${carouselSlides[0]?.suggestedHeadline || "Multi-slide"}`,
        url: "", // First slide URL as thumbnail
        provider: "openai",
        createdAt: Date.now(),
        slides,
      });
    }
  }

  if (assets.length === 0) {
    const total =
      counts.portrait +
      counts.portrait34 +
      counts.square +
      counts.landscape +
      counts.video +
      counts.carousel;
    for (let i = 0; i < total; i++) {
      assets.push({
        id: uuid(),
        type: "image",
        aspectRatio: "1:1",
        status: "pending",
        description: "Generated asset",
        url: "",
        provider: "openai",
        createdAt: Date.now(),
      });
    }
  }

  return assets;
}

async function generateAllAssets({
  assets,
  uploadedUrls,
  openaiKey,
  falKey,
  onProgress,
  onAssetUpdate,
  onError,
  onLog,
}: {
  assets: Asset[];
  uploadedUrls: string[];
  openaiKey: string;
  falKey: string | null;
  onProgress: (value: number) => void;
  onAssetUpdate: (asset: Asset) => void;
  onError: (message: string) => void;
  onLog: (message: string, level?: "info" | "error") => void;
}) {
  // Separate images, videos, and carousels
  const imageAssets = assets.filter((a) => a.type === "image");
  const videoAssets = assets.filter((a) => a.type === "video");
  const carouselAssets = assets.filter((a) => a.type === "carousel");
  const total = assets.length;
  let completed = 0;
  const concurrency = 2;
  let fatalError = false;
  const completedImageUrls: string[] = [];

  // Worker for image generation
  const imageWorker = async (queue: { asset: Asset; index: number }[]) => {
    while (queue.length > 0 && !fatalError) {
      const next = queue.shift();
      if (!next) return;
      const { asset } = next;
      onAssetUpdate({ ...asset, status: "generating" });
      onLog(`Generating ${asset.type} ${asset.aspectRatio}...`);
      try {
        const numUrls = uploadedUrls.length;
        const refIndex =
          numUrls > 0
            ? (asset.sourceImageIndex != null
                ? Math.max(0, Math.min(asset.sourceImageIndex, numUrls - 1))
                : next.index % numUrls)
            : 0;
        const referenceImage = numUrls > 0 ? [uploadedUrls[refIndex]] : [];
        
        const result = await generateImage(openaiKey, falKey, {
          prompt: asset.description,
          aspectRatio: asset.aspectRatio,
          referenceImageUrls: referenceImage,
          quality: "high",
        });

        completedImageUrls.push(result.url);
        onAssetUpdate({
          ...asset,
          status: "completed",
          url: result.url,
          provider: result.provider,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed";
        onAssetUpdate({ ...asset, status: "failed", error: message });
        onLog(`Failed ${asset.type} ${asset.aspectRatio}: ${message}`, "error");
        if (
          message.includes("rate limit") ||
          message.includes("payment method") ||
          message.includes("Limit 0")
        ) {
          fatalError = true;
          onError(message);
        }
      }
      completed += 1;
      onProgress(clamp(25 + (completed / total) * 60, 25, 90));
    }
  };

  // Generate all images first
  const imageQueue = imageAssets.map((asset, index) => ({ asset, index }));
  if (imageQueue.length > 0) {
    onLog(`Generating ${imageQueue.length} images first...`);
    await Promise.all(Array.from({ length: concurrency }, () => imageWorker([...imageQueue.splice(0, Math.ceil(imageQueue.length / concurrency))])));
  }

  // Now generate videos using completed generated images as source
  if (videoAssets.length > 0 && !fatalError) {
    // Pick the best source: a completed generated image, or fall back to upload
    const videoSourceUrl = completedImageUrls[0] ?? uploadedUrls[0] ?? "";
    if (completedImageUrls.length > 0) {
      onLog(`Using generated image as video source (higher quality).`);
    } else {
      onLog(`No generated images available, using uploaded image for video.`);
    }

    for (const asset of videoAssets) {
      if (fatalError) break;
      onAssetUpdate({ ...asset, status: "generating" });
      onLog(`Generating video: ${asset.description.slice(0, 60)}...`);
      try {
        // Rotate through completed images if we have multiple
        const sourceIndex = videoAssets.indexOf(asset) % Math.max(1, completedImageUrls.length);
        const sourceUrl = completedImageUrls[sourceIndex] ?? videoSourceUrl;
        
        const result = await generateVideo(openaiKey, falKey, {
          prompt: asset.description,
          sourceImageUrl: sourceUrl,
          duration: 8,
          aspectRatio: "16:9",
        });
        onAssetUpdate({
          ...asset,
          status: "completed",
          url: result.url,
          provider: result.provider,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed";
        onAssetUpdate({ ...asset, status: "failed", error: message });
        onLog(`Failed video: ${message}`, "error");
        if (
          message.includes("rate limit") ||
          message.includes("payment method") ||
          message.includes("Limit 0")
        ) {
          fatalError = true;
          onError(message);
        }
      }
      completed += 1;
      onProgress(clamp(25 + (completed / total) * 60, 25, 90));
    }
  }

  // Generate carousels - each carousel has multiple slides
  if (carouselAssets.length > 0 && !fatalError) {
    onLog(`Generating ${carouselAssets.length} carousel(s)...`);

    for (const carouselAsset of carouselAssets) {
      if (fatalError) break;
      if (!carouselAsset.slides || carouselAsset.slides.length === 0) continue;

      onAssetUpdate({ ...carouselAsset, status: "generating" });
      onLog(`Generating carousel with ${carouselAsset.slides.length} slides...`);

      const updatedSlides: CarouselSlide[] = [];
      let firstSlideUrl = "";

      // Generate each slide sequentially
      for (let i = 0; i < carouselAsset.slides.length; i++) {
        if (fatalError) break;
        const slide = carouselAsset.slides[i];
        onLog(`  Generating slide ${i + 1}/${carouselAsset.slides.length}...`);

        try {
          const refIndex = i % Math.max(1, uploadedUrls.length);
          const referenceImage = uploadedUrls.length > 0 ? [uploadedUrls[refIndex]] : [];

          const result = await generateImage(openaiKey, falKey, {
            prompt: slide.prompt,
            aspectRatio: "1:1", // Carousels are square
            referenceImageUrls: referenceImage,
            quality: "high",
          });

          if (i === 0) firstSlideUrl = result.url;

          updatedSlides.push({
            ...slide,
            imageUrl: result.url,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed";
          onLog(`  Failed slide ${i + 1}: ${message}`, "error");
          // Mark slide as failed but continue with others
          updatedSlides.push({
            ...slide,
            imageUrl: "", // Empty URL indicates failure
          });

          if (
            message.includes("rate limit") ||
            message.includes("payment method") ||
            message.includes("Limit 0")
          ) {
            fatalError = true;
            onError(message);
            break;
          }
        }
      }

      // Update carousel asset with generated slides
      const allSlidesGenerated = updatedSlides.every((s) => s.imageUrl);
      onAssetUpdate({
        ...carouselAsset,
        status: allSlidesGenerated ? "completed" : "failed",
        url: firstSlideUrl, // Use first slide as thumbnail
        slides: updatedSlides,
        error: allSlidesGenerated ? undefined : "Some slides failed to generate",
      });

      completed += 1;
      onProgress(clamp(25 + (completed / total) * 60, 25, 90));
    }
  }
}
