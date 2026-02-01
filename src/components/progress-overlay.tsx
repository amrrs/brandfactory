"use client";

import { useEffect, useState } from "react";

interface ProgressOverlayProps {
  show: boolean;
  phase: string;
  progress: number;
  message: string;
  onCancel?: () => void;
}

const STEPS = [
  { id: "analyzing", label: "Analyzing" },
  { id: "generating", label: "Generating" },
  { id: "completed", label: "Complete" },
];

// Fun messages that rotate during generation
const FUN_MESSAGES = [
  "Brewing creative magic... ✨",
  "Teaching pixels to dance... 💃",
  "Channeling creative energy... 🎨",
  "Adding a sprinkle of awesome... ⭐",
  "Making your brand look stunning... 💅",
  "Crafting visual awesomeness... 🚀",
  "Mixing colors with love... 🎯",
  "Almost there, promise! 🤞",
  "Good things take time... ⏳",
  "Your assets are cooking... 🍳",
];

export function ProgressOverlay({
  show,
  phase,
  progress,
  message,
  onCancel,
}: ProgressOverlayProps) {
  const [funMessageIndex, setFunMessageIndex] = useState(0);

  // Rotate fun messages every 3 seconds
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setFunMessageIndex((prev) => (prev + 1) % FUN_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  // Estimate remaining time based on progress (rough estimate: ~30 seconds total)
  const estimatedTotalSeconds = 30;
  const remainingSeconds = Math.max(0, Math.round(((100 - progress) / 100) * estimatedTotalSeconds));
  const timeDisplay = remainingSeconds > 60 
    ? `~${Math.ceil(remainingSeconds / 60)} min remaining`
    : remainingSeconds > 0 
      ? `~${remainingSeconds}s remaining`
      : "Almost done...";

  const currentStepIndex = STEPS.findIndex(s => s.id === phase);
  const funMessage = FUN_MESSAGES[funMessageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label="Generation progress">
      {/* Animated background grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      
      <div className="relative w-[420px] rounded-2xl border border-zinc-700 bg-zinc-900/90 p-8 text-center animate-fade-in-scale">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isComplete = index < currentStepIndex;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : isComplete 
                      ? "bg-zinc-700/50 text-zinc-300"
                      : "bg-zinc-800/50 text-zinc-500"
                }`}>
                  {isComplete ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-zinc-600" />
                  )}
                  {step.label}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 ${isComplete ? "bg-green-500/50" : "bg-zinc-700"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Spinning logo */}
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-700 border-t-green-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-zinc-800 border-b-emerald-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          <img
            src="/assets/openai.svg"
            alt="Processing"
            className="absolute inset-0 m-auto h-8 w-8 logo-white"
          />
        </div>

        {/* Phase indicator */}
        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 mb-4">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-green-400">
            {phase}
          </span>
        </div>

        {/* Fun rotating message */}
        <div className="text-base font-medium text-white mb-1 transition-all duration-300">
          {funMessage}
        </div>
        
        {/* Actual status message */}
        <div className="text-xs text-zinc-400 mb-2">{message}</div>
        
        {/* Estimated time */}
        <div className="text-[10px] text-zinc-500 mb-6">{timeDisplay}</div>

        {/* Progress bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 progress-glow"
            style={{ width: `${progress}%` }}
          />
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer" />
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <span>Processing...</span>
          <span className="font-mono text-green-400">{Math.round(progress)}%</span>
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-xs text-zinc-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
          >
            Cancel generation
          </button>
        )}
      </div>
    </div>
  );
}
