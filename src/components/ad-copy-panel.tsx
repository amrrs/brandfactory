"use client";

import { AdCopy } from "@/lib/types";
import { useState } from "react";

interface AdCopyPanelProps {
  adCopy: AdCopy | null;
  onRegenerate?: () => void;
  onCopy?: (value: string) => void;
}

export function AdCopyPanel({ adCopy, onRegenerate, onCopy }: AdCopyPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!adCopy) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700/50 bg-zinc-900/20 p-5 flex items-center gap-4">
        {/* Document icon */}
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-violet-500/5 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="h-5 w-5 text-blue-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400">Words that sell 📝</p>
          <p className="text-[10px] text-zinc-500">Catchy headlines & hashtags coming soon</p>
        </div>
      </div>
    );
  }

  const fullCopy = [
    `Headline: ${adCopy.headline}`,
    adCopy.tagline ? `Tagline: ${adCopy.tagline}` : null,
    `Description: ${adCopy.description}`,
    `CTA: ${adCopy.cta}`,
    `Hashtags: ${adCopy.hashtags.map((h) => `#${h}`).join(" ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const handleCopy = () => {
    onCopy?.(fullCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500/20 to-violet-500/10 border border-blue-500/30 flex items-center justify-center">
            <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xs font-semibold text-zinc-300">Ad Copy</h3>
        </div>
        <div className="flex gap-1.5">
          <button
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-all ${
              copied
                ? "bg-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
            onClick={handleCopy}
            type="button"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            className="rounded-md bg-zinc-800/50 px-2.5 py-1 text-[10px] font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
            onClick={onRegenerate}
            type="button"
          >
            Redo
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Headline with gradient accent */}
        <div className="relative pl-3">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
          <p className="text-sm font-bold text-white">{adCopy.headline}</p>
          {adCopy.tagline && <p className="text-xs text-zinc-400 italic mt-0.5">{adCopy.tagline}</p>}
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed">{adCopy.description}</p>

        {/* CTA with glow */}
        <span className="inline-block rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]">
          {adCopy.cta}
        </span>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {adCopy.hashtags.map((h) => (
            <span 
              key={h} 
              className="text-[10px] text-zinc-500 bg-zinc-800/50 rounded px-1.5 py-0.5 hover:text-blue-400 transition-colors cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(`#${h}`);
              }}
            >
              #{h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
