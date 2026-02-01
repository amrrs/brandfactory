"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { APIKeyDialog } from "@/components/api-key-dialog";
import { UploadZone } from "@/components/upload-zone";
import { AssetConfig } from "@/components/asset-config";
import { AssetGrid } from "@/components/asset-grid";
import { HistorySidebar } from "@/components/history-sidebar";
import { ProgressOverlay } from "@/components/progress-overlay";
import { AssetViewerModal } from "@/components/asset-viewer-modal";
import { CarouselEditor } from "@/components/carousel-editor";
import { DebugLogPanel } from "@/components/debug-log-panel";
import { ConfettiCelebration } from "@/components/confetti-celebration";
import { EngagementAnalyzer } from "@/components/engagement-analyzer";
import { BrandAnalyzer } from "@/components/brand-analyzer";
import { useAPIKeys } from "@/hooks/use-api-keys";
import { useAssetGeneration } from "@/hooks/use-asset-generation";
import { useHistory } from "@/hooks/use-history";
import { uuid } from "@/lib/utils";
import { Asset, CarouselSlide, EngagementAnalysis, BrandStrategy } from "@/lib/types";
import { useDebugLogs } from "@/hooks/use-debug-logs";
import { analyzeEngagement } from "@/services/ai/engagementAnalysis";
import { analyzeBrandStrategy } from "@/services/ai/brandStrategyAnalysis";

export default function Home() {
  const { openaiKey, falKey, hasOpenAI, hasFal, setOpenAIKey, setFalKey } =
    useAPIKeys();
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [viewerAsset, setViewerAsset] = useState<Asset | null>(null);
  const [carouselEditorAsset, setCarouselEditorAsset] = useState<Asset | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<"assets" | "engagement" | "strategy">("assets");
  const [engagementAnalysis, setEngagementAnalysis] = useState<EngagementAnalysis | null>(null);
  const [brandStrategy, setBrandStrategy] = useState<BrandStrategy | null>(null);
  const [isAnalyzingEngagement, setIsAnalyzingEngagement] = useState(false);
  const [isAnalyzingStrategy, setIsAnalyzingStrategy] = useState(false);
  const { logs, addLog, clearLogs } = useDebugLogs();

  const {
    state,
    uploadImages,
    removeImage,
    setInstruction,
    setAssetCounts,
    generate,
    downloadAsset,
    downloadAll,
    generateVariant,
  } = useAssetGeneration(openaiKey, falKey, addLog);

  const { history, addHistoryItem, deleteHistoryItem } = useHistory();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Easter egg: Konami code (↑↑↓↓←→←→BA) triggers party mode 🎉
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiIndex = 0;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          // Party mode activated! 🎊
          setShowConfetti(true);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!hasOpenAI) {
      const dismissed = localStorage.getItem("brandfactory-dismissed-keys");
      if (!dismissed) setShowKeyDialog(true);
    }
  }, [hasOpenAI]);

  const lastPhaseRef = useRef(state.currentPhase);
  useEffect(() => {
    if (
      lastPhaseRef.current !== "completed" &&
      state.currentPhase === "completed" &&
      state.generatedAssets.length > 0
    ) {
      // Trigger confetti celebration! 🎉
      setShowConfetti(true);
      
      const first = state.generatedAssets.find((asset) => asset.url);
      if (first) {
        addHistoryItem({
          ...first,
          id: uuid(),
          createdAt: Date.now(),
          brandName: state.brandContext?.brandName,
          thumbnail: first.type === "video" ? first.url : undefined,
          assetsCount: state.generatedAssets.length,
          summary: `${state.generatedAssets.length} assets generated`,
          adCopyHeadline: state.adCopy?.headline,
        });
      }
    }
    lastPhaseRef.current = state.currentPhase;
  }, [addHistoryItem, state.brandContext?.brandName, state.currentPhase, state.generatedAssets]);

  const apiStatus = useMemo(
    () => (hasOpenAI ? "Configured" : "Missing"),
    [hasOpenAI]
  );
  const falStatus = useMemo(() => (hasFal ? "Configured" : "Optional"), [hasFal]);

  const totalAssets = Object.values(state.assetCounts).reduce((a, b) => a + b, 0);

  const handleAnalyzeEngagement = async () => {
    console.log("🔍 handleAnalyzeEngagement called");
    console.log("hasOpenAI:", hasOpenAI);
    console.log("uploadedImages:", state.uploadedImages.length);
    
    if (!hasOpenAI) {
      setShowKeyDialog(true);
      return;
    }

    if (state.uploadedImages.length === 0) {
      addLog("No image to analyze");
      return;
    }

    const apiKey = openaiKey;
    if (!apiKey) {
      setShowKeyDialog(true);
      return;
    }

    setIsAnalyzingEngagement(true);
    addLog("Starting engagement analysis...");

    try {
      // Convert the uploaded file to base64
      const file = state.uploadedImages[0];
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const imageUrl = await base64Promise;
      console.log("Analyzing image URL:", imageUrl.substring(0, 50) + "...");
      
      const analysis = await analyzeEngagement(apiKey, imageUrl);
      setEngagementAnalysis(analysis);
      addLog(`Engagement analysis complete. Overall score: ${analysis.overallScore}/100`);
    } catch (error) {
      console.error("Engagement analysis error:", error);
      addLog(`Engagement analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAnalyzingEngagement(false);
    }
  };

  const handleAnalyzeStrategy = async () => {
    console.log("🎯 handleAnalyzeStrategy called");
    console.log("hasOpenAI:", hasOpenAI);
    console.log("uploadedImages:", state.uploadedImages.length);
    
    if (!hasOpenAI) {
      setShowKeyDialog(true);
      return;
    }

    if (state.uploadedImages.length === 0) {
      addLog("No image to analyze");
      return;
    }

    const apiKey = openaiKey;
    if (!apiKey) {
      setShowKeyDialog(true);
      return;
    }

    setIsAnalyzingStrategy(true);
    addLog("Starting brand strategy analysis...");

    try {
      // Convert the uploaded file to base64
      const file = state.uploadedImages[0];
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const imageUrl = await base64Promise;
      console.log("Analyzing image URL:", imageUrl.substring(0, 50) + "...");
      
      const strategy = await analyzeBrandStrategy(apiKey, imageUrl);
      setBrandStrategy(strategy);
      addLog(`Brand strategy analysis complete. Archetype: ${strategy.brandArchetype}`);
    } catch (error) {
      console.error("Brand strategy analysis error:", error);
      addLog(`Brand strategy analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAnalyzingStrategy(false);
    }
  };

  return (
    <div className="min-h-screen dots-bg mesh-gradient">
      {/* Confetti celebration on completion */}
      <ConfettiCelebration 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <ProgressOverlay
        show={state.currentPhase === "analyzing"}
        phase={state.currentPhase}
        progress={state.progress}
        message={state.progressMessage}
      />

      <APIKeyDialog
        open={showKeyDialog}
        openaiKey={openaiKey}
        falKey={falKey}
        onSave={(openai, fal) => {
          if (openai) setOpenAIKey(openai);
          if (fal) setFalKey(fal);
          setShowKeyDialog(false);
          localStorage.removeItem("brandfactory-dismissed-keys");
        }}
        onClose={() => {
          localStorage.setItem("brandfactory-dismissed-keys", "true");
          setShowKeyDialog(false);
        }}
      />

      {showHistory && (
        <HistorySidebar
          history={history}
          onSelect={(item) => window.open(item.url, "_blank")}
          onDelete={deleteHistoryItem}
          onClose={() => setShowHistory(false)}
        />
      )}

      <AssetViewerModal
        asset={viewerAsset}
        onClose={() => setViewerAsset(null)}
        onDownload={downloadAsset}
        onCreateVariant={(asset) =>
          generateVariant(asset, asset.type, asset.aspectRatio)
        }
      />

      {carouselEditorAsset && (
        <CarouselEditor
          asset={carouselEditorAsset}
          onClose={() => setCarouselEditorAsset(null)}
          onSave={(updatedSlides) => {
            // Update the carousel asset with new slides
            addLog(`Carousel saved with ${updatedSlides.length} slides.`);
          }}
          onExport={(slides) => {
            addLog(`Exported ${slides.length} carousel slides.`);
          }}
        />
      )}

      <DebugLogPanel
        open={showLogs}
        logs={logs}
        onClose={() => setShowLogs(false)}
        onClear={clearLogs}
      />

      <header className="glass border-b border-white/10 sticky top-0 z-30 animate-fade-in">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src="/assets/openai.svg" alt="BrandFactory" className="h-8 w-8 logo-white" />
            <div className="text-sm font-bold tracking-tight">BrandFactory</div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status indicators */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500 border-r border-zinc-700 pr-3">
              <div className="flex items-center gap-1.5" title={isMounted ? (hasOpenAI ? "OpenAI API configured" : "OpenAI API key missing") : undefined}>
                <span className={`h-1.5 w-1.5 rounded-full ${isMounted && hasOpenAI ? "bg-green-500" : "bg-zinc-600"}`} />
                <span className={isMounted && hasOpenAI ? "text-zinc-300" : "text-zinc-500"}>OpenAI</span>
              </div>
              <div className="flex items-center gap-1.5" title={isMounted ? (hasFal ? "fal.ai configured" : "fal.ai optional") : undefined}>
                <span className={`h-1.5 w-1.5 rounded-full ${isMounted && hasFal ? "bg-green-500" : "bg-zinc-600"}`} />
                <span className={isMounted && hasFal ? "text-zinc-300" : "text-zinc-500"}>fal.ai</span>
              </div>
            </div>
            
            {/* Icon buttons */}
            <button
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-1.5 text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-700 hover:text-white"
              onClick={() => setShowHistory(true)}
              type="button"
              title="View history"
              aria-label="View history"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-1.5 text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-700 hover:text-white"
              onClick={() => setShowKeyDialog(true)}
              type="button"
              title="API settings"
              aria-label="API settings"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Primary actions - only show on assets tab */}
            {activeTab === "assets" && (
              <div className="flex items-center gap-2 border-l border-zinc-700 pl-3">
                <button
                  className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={downloadAll}
                  type="button"
                  disabled={!state.generatedAssets.some((asset) => asset.status === "completed")}
                >
                  Download
                </button>
                <button
                  className={`btn-glow rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-2 ${
                    state.isProcessing || totalAssets === 0 ? "opacity-70 cursor-not-allowed" : "btn-glow-pulse"
                  }`}
                  onClick={generate}
                  type="button"
                  disabled={state.isProcessing || totalAssets === 0}
                >
                  {state.isProcessing ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating
                    </span>
                  ) : (
                    <>
                      <span className="text-sm">Generate</span>
                      {totalAssets > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                          {totalAssets}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* Error banner */}
        {state.error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400 animate-fade-in">
            {state.error}
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* Left column - Controls with glass panel */}
          <div className="w-full lg:w-[380px] lg:flex-shrink-0">
            <div className="glass-panel p-5 space-y-5">
              <UploadZone
                files={state.uploadedImages}
                previews={state.previewUrls}
                onFilesSelected={uploadImages}
                onRemove={removeImage}
              />

              {/* Asset Generation controls - only show on assets tab */}
              {activeTab === "assets" && (
                <>
                  <div>
                    <div className="group relative rounded-xl border border-zinc-700/50 bg-zinc-900/50 transition-all focus-within:border-green-500/50 focus-within:bg-zinc-900/70 focus-within:shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                      <div className="flex items-center justify-between px-3 pt-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          Creative Direction
                        </label>
                        <span className={`text-[10px] tabular-nums ${state.userInstruction.length >= 450 ? "text-amber-400" : "text-zinc-600"}`}>
                          {state.userInstruction.length}/500
                        </span>
                      </div>
                      
                      <textarea
                        className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none resize-none min-h-[80px]"
                        placeholder="Describe the vibe, lighting, mood..."
                        value={state.userInstruction}
                        onChange={(event) => setInstruction(event.target.value.slice(0, 500))}
                        maxLength={500}
                      />
                      
                      <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                        {["Minimalist", "Bold", "Professional", "Playful", "Luxury"].map((chip) => {
                          const isActive = state.userInstruction.toLowerCase().includes(chip.toLowerCase());
                          return (
                            <button
                              key={chip}
                              type="button"
                              className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all ${
                                isActive 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400"
                              }`}
                              onClick={() => {
                                const current = state.userInstruction.trim();
                                const newValue = current ? `${current}, ${chip.toLowerCase()}` : chip.toLowerCase();
                                setInstruction(newValue.slice(0, 500));
                              }}
                            >
                              {chip}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Assets</h3>
                    <AssetConfig counts={state.assetCounts} onCountsChange={setAssetCounts} />
                  </div>
                </>
              )}

              {/* Engagement Predictor info - only show on engagement tab */}
              {activeTab === "engagement" && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h4 className="text-sm font-bold text-white">Engagement Predictor</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Upload a brand asset to analyze its engagement potential across social media platforms. Get platform-specific scores, insights, and recommendations.
                  </p>
                </div>
              )}

              {/* Brand Analysis info - only show on strategy tab */}
              {activeTab === "strategy" && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-sm font-bold text-white">Brand Analysis</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Upload a brand image to receive a comprehensive strategy including target audience, brand archetype, messaging pillars, and platform-specific content recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Tabbed interface */}
          <div className="flex-1 mt-6 lg:mt-0">
            {/* Tab navigation */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveTab("assets")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "assets"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Asset Generation
                {state.generatedAssets.length > 0 && (
                  <span className="ml-2 rounded-full bg-zinc-700 px-2 py-0.5 text-xs">
                    {state.generatedAssets.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("engagement")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "engagement"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Engagement Predictor
              </button>
              <button
                onClick={() => setActiveTab("strategy")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "strategy"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Brand Analysis
              </button>
            </div>

            {/* Tab content */}
            <div className="preview-area orbs-bg rounded-2xl p-5">
              {activeTab === "assets" && (
                <AssetGrid
                  assets={state.generatedAssets}
                  onAssetClick={(asset) => {
                    if (asset.type === "carousel") {
                      setCarouselEditorAsset(asset);
                    } else {
                      setViewerAsset(asset);
                    }
                  }}
                  onDownload={downloadAsset}
                  onCreateVariant={(asset) =>
                    generateVariant(asset, asset.type, asset.aspectRatio)
                  }
                />
              )}

              {activeTab === "engagement" && (
                <EngagementAnalyzer
                  analysis={engagementAnalysis}
                  isAnalyzing={isAnalyzingEngagement}
                  onAnalyze={handleAnalyzeEngagement}
                  hasImage={state.uploadedImages.length > 0}
                  imagePreview={state.previewUrls[0]}
                />
              )}

              {activeTab === "strategy" && (
                <BrandAnalyzer
                  strategy={brandStrategy}
                  isAnalyzing={isAnalyzingStrategy}
                  onAnalyze={handleAnalyzeStrategy}
                  hasImage={state.uploadedImages.length > 0}
                  imagePreview={state.previewUrls[0]}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
