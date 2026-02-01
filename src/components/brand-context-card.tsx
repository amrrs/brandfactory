"use client";

import { BrandAnalysis } from "@/lib/types";

interface BrandContextCardProps {
  context: BrandAnalysis | null;
}

export function BrandContextCard({ context }: BrandContextCardProps) {
  if (!context) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700/50 bg-zinc-900/20 p-5 flex items-center gap-4">
        {/* Animated lightbulb icon */}
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="h-5 w-5 text-amber-500/50 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400">Ready to analyze your brand 🔍</p>
          <p className="text-[10px] text-zinc-500">Drop an image and we&apos;ll work our magic</p>
        </div>
      </div>
    );
  }

  const normalizeColor = (value: string) => {
    const trimmed = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
    if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) return trimmed;
    if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
    if (/^[0-9a-fA-F]{3}$/.test(trimmed)) return `#${trimmed}`;
    return null;
  };

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 flex items-center justify-center">
          <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xs font-semibold text-zinc-300">Brand Analysis</h3>
      </div>

      <div className="space-y-3">
        {/* Colors with glow effect */}
        <div className="flex flex-wrap gap-2">
          {context.colors.map((color, idx) => {
            const normalized = normalizeColor(color);
            return (
              <div
                key={color}
                className="h-7 w-7 rounded-lg border border-white/10 shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
                style={{ 
                  backgroundColor: normalized ?? "transparent",
                  boxShadow: normalized ? `0 4px 12px ${normalized}40` : undefined,
                  animationDelay: `${idx * 50}ms`
                }}
                title={normalized ?? color}
              />
            );
          })}
        </div>

        {/* Subject */}
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Subject</span>
          <p className="text-xs text-white mt-0.5">{context.subject}</p>
        </div>

        {/* Mood */}
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Mood</span>
          <p className="text-xs text-zinc-300 mt-0.5">{context.mood}</p>
        </div>

        {/* Brand & Industry */}
        {(context.brandName || context.industry) && (
          <div className="flex items-center gap-3 text-xs pt-1">
            {context.brandName && (
              <span className="inline-flex items-center gap-1 text-white font-medium bg-zinc-800/50 rounded-md px-2 py-0.5">
                {context.brandName}
              </span>
            )}
            {context.industry && (
              <span className="text-zinc-500">{context.industry}</span>
            )}
          </div>
        )}

        {context.slogan && (
          <div className="mt-2 pt-2 border-t border-zinc-700/50">
            <p className="text-xs text-zinc-400 italic border-l-2 border-green-500/50 pl-2">&ldquo;{context.slogan}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
