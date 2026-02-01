"use client";

import { useEffect } from "react";
import { Asset } from "@/lib/types";

interface AssetViewerModalProps {
  asset: Asset | null;
  onClose: () => void;
  onDownload: (asset: Asset) => void;
  onCreateVariant?: (asset: Asset) => void;
}

export function AssetViewerModal({
  asset,
  onClose,
  onDownload,
  onCreateVariant,
}: AssetViewerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!asset) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Asset preview"
    >
      <div
        className="relative flex w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl animate-fade-in-scale"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - fixed at top */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              {asset.type}
            </span>
            <span className="text-xs text-zinc-500">{asset.aspectRatio}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition-all hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - scrollable area */}
        <div className="flex-1 overflow-auto min-h-0">
          {/* Media container */}
          <div className="flex items-center justify-center bg-zinc-950 p-4">
            {asset.url ? (
              asset.type === "image" ? (
                <img
                  src={asset.url}
                  alt={asset.description}
                  className="max-w-full rounded-lg shadow-lg"
                  style={{ maxHeight: "60vh" }}
                />
              ) : (
                <video
                  src={asset.url}
                  controls
                  autoPlay
                  className="max-w-full rounded-lg"
                  style={{ maxHeight: "60vh" }}
                />
              )
            ) : (
              <div className="rounded-xl bg-zinc-800 px-12 py-16 text-center">
                <svg className="mx-auto h-10 w-10 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-zinc-500">
                  {asset.status === "generating"
                    ? "Generating..."
                    : asset.status === "failed"
                      ? asset.error ?? "Generation failed"
                      : "No preview"}
                </p>
              </div>
            )}
          </div>

          {/* Description - inside scrollable area */}
          {asset.description && (
            <div className="border-t border-zinc-800 bg-zinc-900 px-4 py-3">
              <p className="text-xs text-zinc-400 leading-relaxed">{asset.description}</p>
            </div>
          )}
        </div>

        {/* Actions - fixed at bottom */}
        <div className="flex-shrink-0 flex items-center justify-end gap-2 border-t border-zinc-800 bg-zinc-900 px-4 py-3">
          {onCreateVariant && (
            <button
              type="button"
              onClick={() => onCreateVariant(asset)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-700"
            >
              Generate variant
            </button>
          )}
          <button
            type="button"
            onClick={() => onDownload(asset)}
            disabled={!asset.url}
            className="btn-glow rounded-lg px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
