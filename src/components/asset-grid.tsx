"use client";

import { Asset } from "@/lib/types";
import { AssetCard } from "./asset-card";

interface AssetGridProps {
  assets: Asset[];
  onAssetClick?: (asset: Asset) => void;
  onDownload?: (asset: Asset) => void;
  onCreateVariant?: (asset: Asset) => void;
}

export function AssetGrid({
  assets,
  onAssetClick,
  onDownload,
  onCreateVariant,
}: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700/50 bg-zinc-900/20 p-8">
        {/* Animated device mockups */}
        <div className="flex items-end justify-center gap-4 mb-6">
          {/* Phone (Stories) */}
          <div className="relative opacity-30 hover:opacity-60 transition-opacity animate-float" style={{ animationDelay: "0s" }}>
            <div className="w-10 h-20 border-2 border-zinc-600 rounded-lg bg-zinc-800/50 relative overflow-hidden">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-zinc-700 rounded-full" />
              <div className="absolute inset-2 top-3 rounded bg-gradient-to-b from-green-500/10 to-transparent" />
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-zinc-600 whitespace-nowrap">9:16</span>
          </div>
          
          {/* Square (Feed) */}
          <div className="relative opacity-30 hover:opacity-60 transition-opacity animate-float" style={{ animationDelay: "0.2s" }}>
            <div className="w-14 h-14 border-2 border-zinc-600 rounded-lg bg-zinc-800/50 overflow-hidden">
              <div className="absolute inset-2 rounded bg-gradient-to-br from-blue-500/10 to-transparent" />
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-zinc-600">1:1</span>
          </div>
          
          {/* Landscape (YouTube) */}
          <div className="relative opacity-30 hover:opacity-60 transition-opacity animate-float" style={{ animationDelay: "0.4s" }}>
            <div className="w-20 h-12 border-2 border-zinc-600 rounded-lg bg-zinc-800/50 overflow-hidden flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-700" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-zinc-600">16:9</span>
          </div>
        </div>
        
        <p className="text-sm text-zinc-400 text-center mb-1">Let&apos;s make something beautiful ✨</p>
        <p className="text-[10px] text-zinc-600 text-center">Hit Generate when you&apos;re ready</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start stagger-children">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onClick={onAssetClick}
          onDownload={onDownload}
          onCreateVariant={onCreateVariant}
        />
      ))}
    </div>
  );
}
