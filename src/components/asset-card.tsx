"use client";

import { useState } from "react";
import { Asset } from "@/lib/types";

interface AssetCardProps {
  asset: Asset;
  onClick?: (asset: Asset) => void;
  onDownload?: (asset: Asset) => void;
  onCreateVariant?: (asset: Asset) => void;
}

const REACTIONS = ["🔥", "❤️", "✨", "🎯"];

export function AssetCard({
  asset,
  onClick,
  onDownload,
  onCreateVariant,
}: AssetCardProps) {
  const [reaction, setReaction] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  return (
    <div className="group rounded-xl border border-zinc-700 bg-zinc-800/50 p-3 transition-all hover:border-zinc-600 hover:bg-zinc-800 hover:scale-[1.02]">
      <div className="flex items-center justify-between text-xs">
        <span className="rounded-md bg-zinc-700 px-2 py-0.5 font-medium text-zinc-300">
          {asset.type.toUpperCase()}
        </span>
        <span className="text-zinc-500">{asset.aspectRatio}</span>
      </div>
      
      <div 
        className="relative mt-3 overflow-hidden rounded-lg bg-zinc-900"
        style={{
          aspectRatio: asset.aspectRatio === "9:16" ? "9/16" 
            : asset.aspectRatio === "3:4" ? "3/4"
            : asset.aspectRatio === "16:9" ? "16/9"
            : "1/1", // default square for 1:1 and carousel
          maxHeight: asset.aspectRatio === "9:16" ? "280px" : "200px", // cap tall images
        }}
      >
        {asset.type === "carousel" && asset.slides && asset.slides.length > 0 ? (
          // Carousel preview - show stacked slides
          <div className="relative h-full w-full">
            {/* Stacked slide effect */}
            {asset.slides.slice(0, 3).map((slide, i) => (
              <div
                key={slide.id}
                className="absolute inset-0 rounded-lg overflow-hidden transition-all"
                style={{
                  transform: `translateX(${i * 8}px) translateY(${i * 4}px)`,
                  zIndex: 3 - i,
                  opacity: slide.imageUrl ? 1 : 0.5,
                }}
              >
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={`Slide ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-800" />
                )}
              </div>
            ))}
            {/* Slide count badge */}
            <div className="absolute bottom-2 right-2 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
              {asset.slides.length} slides
            </div>
          </div>
        ) : asset.url ? (
          asset.type === "image" ? (
            <img
              src={asset.url}
              alt={asset.description}
              className="h-full w-full object-cover transition-all group-hover:scale-105"
            />
          ) : (
            <video
              src={asset.url}
              className="h-full w-full object-cover"
              controls
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            {asset.status === "generating" ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-2 border-zinc-700 border-t-green-500 animate-spin" />
                  <img
                    src="/assets/openai.svg"
                    alt="Loading"
                    className="absolute inset-0 m-auto h-5 w-5 logo-white"
                  />
                </div>
                <span className="text-xs text-zinc-500">
                  {asset.type === "carousel" ? "Generating slides..." : "Generating..."}
                </span>
              </div>
            ) : (
              <span className="text-xs text-zinc-600">Pending</span>
            )}
          </div>
        )}
        
        {asset.status === "generating" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
            <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-emerald-400 animate-shimmer progress-glow" />
          </div>
        )}

        {asset.status === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition-all hover:scale-105"
              onClick={() => onClick?.(asset)}
              type="button"
            >
              {asset.type === "carousel" ? "Edit" : "View"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              asset.status === "completed"
                ? "bg-green-500/20 text-green-400"
                : asset.status === "generating"
                ? "bg-yellow-500/20 text-yellow-400"
                : asset.status === "failed"
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-700 text-zinc-400"
            }`}
          >
            {asset.status}
          </span>
          {asset.status === "completed" && (
            <span className="text-[10px] text-zinc-500">{asset.provider}</span>
          )}
        </div>
        
        {/* Emoji reactions */}
        {asset.status === "completed" && (
          <div className="relative">
            {reaction ? (
              <button
                onClick={() => setReaction(null)}
                className="text-base hover:scale-125 transition-transform"
                title="Remove reaction"
              >
                {reaction}
              </button>
            ) : (
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors text-xs"
                title="Add reaction"
              >
                😊
              </button>
            )}
            {showReactions && !reaction && (
              <div className="absolute bottom-full right-0 mb-1 flex gap-1 rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 shadow-xl animate-fade-in z-10">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setReaction(emoji);
                      setShowReactions(false);
                    }}
                    className="text-base hover:scale-125 transition-transform p-0.5"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {asset.status === "failed" && asset.error && (
        <div className="mt-2 rounded-lg bg-red-500/10 p-2 text-[10px] text-red-400 line-clamp-2">
          {asset.error}
        </div>
      )}

      {asset.status === "completed" && (
        <div className="mt-3 flex items-center gap-2">
          <button
            className="flex-1 rounded-lg border border-zinc-600 bg-zinc-700/50 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:bg-zinc-700 active:scale-95"
            onClick={() => onCreateVariant?.(asset)}
            type="button"
            aria-label={`Generate variant of ${asset.type}`}
          >
            Regenerate
          </button>
          <button
            className="flex-1 rounded-lg border border-zinc-600 bg-zinc-700/50 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-green-500 hover:bg-green-500/20 hover:text-green-400 active:scale-95"
            onClick={() => onDownload?.(asset)}
            type="button"
            aria-label={`Download ${asset.type}`}
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
