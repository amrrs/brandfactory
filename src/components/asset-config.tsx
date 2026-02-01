"use client";

import { MAX_PER_TYPE } from "@/lib/constants";
import { AssetCounts } from "@/lib/types";

interface AssetConfigProps {
  counts: AssetCounts;
  onCountsChange: (counts: AssetCounts) => void;
}

const PRESETS = [
  { name: "Social", counts: { portrait: 1, portrait34: 0, square: 1, landscape: 0, video: 1, carousel: 0 } },
  { name: "Stories", counts: { portrait: 3, portrait34: 0, square: 0, landscape: 0, video: 0, carousel: 0 } },
  { name: "Feed", counts: { portrait: 0, portrait34: 2, square: 2, landscape: 0, video: 0, carousel: 0 } },
  { name: "YouTube", counts: { portrait: 0, portrait34: 0, square: 0, landscape: 3, video: 1, carousel: 0 } },
];

// Icons for each format type
const FormatIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "portrait":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <line x1="10" y1="19" x2="14" y2="19" />
        </svg>
      );
    case "portrait34":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="3" width="14" height="18" rx="1" />
        </svg>
      );
    case "square":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="1" />
        </svg>
      );
    case "landscape":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="12" rx="1" />
        </svg>
      );
    case "video":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "carousel":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="6" width="6" height="12" rx="1" />
          <rect x="9" y="4" width="6" height="16" rx="1" />
          <rect x="16" y="6" width="6" height="12" rx="1" />
        </svg>
      );
    default:
      return null;
  }
};

const ASSET_TYPES = [
  { key: "portrait" as const, name: "Stories", ratio: "9:16" },
  { key: "portrait34" as const, name: "Portrait", ratio: "3:4" },
  { key: "square" as const, name: "Feed", ratio: "1:1" },
  { key: "landscape" as const, name: "Landscape", ratio: "3:2" },
  { key: "video" as const, name: "Video", ratio: "16:9" },
  { key: "carousel" as const, name: "Carousel", ratio: "5 slides" },
];

export function AssetConfig({ counts, onCountsChange }: AssetConfigProps) {
  const applyPreset = (preset: typeof PRESETS[0]) => {
    onCountsChange(preset.counts as AssetCounts);
  };

  const clearAll = () => {
    onCountsChange({ portrait: 0, portrait34: 0, square: 0, landscape: 0, video: 0, carousel: 0 });
  };

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    const toggleAsset = (key: keyof AssetCounts) => {
      const current = counts[key];
      onCountsChange({ ...counts, [key]: current > 0 ? 0 : 1 });
    };

    const updateCount = (key: keyof AssetCounts, delta: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const current = counts[key];
      const next = Math.max(0, Math.min(MAX_PER_TYPE, current + delta));
      onCountsChange({ ...counts, [key]: next });
    };

    const staticAssets = ASSET_TYPES.filter(t => !['video', 'carousel'].includes(t.key));
    const motionAssets = ASSET_TYPES.filter(t => ['video', 'carousel'].includes(t.key));

    const AssetTile = ({ type }: { type: typeof ASSET_TYPES[0] }) => {
      const count = counts[type.key];
      const isActive = count > 0;
      
      return (
        <div
          onClick={() => toggleAsset(type.key)}
          className={`group relative flex flex-col justify-between rounded-xl border p-3 transition-all cursor-pointer ${
            isActive
              ? "border-green-500/50 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
              : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-800/50"
          }`}
        >
          <div className="flex items-start justify-between">
            <span className={`transition-colors ${isActive ? "text-green-400" : "text-zinc-500 group-hover:text-zinc-400"}`}>
              <FormatIcon type={type.key} />
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? "text-green-500/70" : "text-zinc-600"}`}>
              {type.ratio}
            </span>
          </div>
          
          <div className="mt-2">
            <div className={`text-xs font-medium transition-colors ${isActive ? "text-white" : "text-zinc-400"}`}>
              {type.name}
            </div>
          </div>

          {/* Controls appear when active or hovered */}
          <div className={`absolute bottom-2 right-2 flex items-center gap-1 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            {isActive ? (
              <>
                <button 
                  onClick={(e) => updateCount(type.key, -1, e)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                >
                  -
                </button>
                <span className="min-w-[12px] text-center text-xs font-bold text-white">{count}</span>
                <button 
                  onClick={(e) => updateCount(type.key, 1, e)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                >
                  +
                </button>
              </>
            ) : (
              <span className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        {/* Presets as segmented control */}
        <div className="flex w-full rounded-lg bg-zinc-900/50 p-1 border border-zinc-800">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="flex-1 rounded-md py-1.5 text-[10px] font-medium text-zinc-500 transition-all hover:bg-zinc-800 hover:text-zinc-300 active:bg-zinc-700"
            >
              {preset.name}
            </button>
          ))}
          <div className="mx-1 w-px bg-zinc-800 my-1" />
          <button
            type="button"
            onClick={clearAll}
            className="px-3 rounded-md py-1.5 text-[10px] font-medium text-zinc-600 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            Clear
          </button>
        </div>

        {/* Grid Layout */}
        <div className="space-y-3">
          {/* Static Images Grid */}
          <div className="grid grid-cols-2 gap-2">
            {staticAssets.map((type) => (
              <AssetTile key={type.key} type={type} />
            ))}
          </div>

          {/* Motion Assets Grid */}
          <div className="grid grid-cols-2 gap-2">
             {motionAssets.map((type) => (
              <AssetTile key={type.key} type={type} />
            ))}
          </div>
        </div>

      {/* Total count badge removed - handled by main Generate button now */}
    </div>
  );
}
