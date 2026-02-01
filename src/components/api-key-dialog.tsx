"use client";

import { useState } from "react";
import type { FormEvent } from "react";

interface APIKeyDialogProps {
  open: boolean;
  openaiKey: string | null;
  falKey: string | null;
  onSave: (openaiKey: string, falKey: string) => void;
  onClose: () => void;
}

export function APIKeyDialog({
  open,
  openaiKey,
  falKey,
  onSave,
  onClose,
}: APIKeyDialogProps) {
  const openaiDefault = openaiKey ?? "";
  const falDefault = falKey ?? "";
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showFalKey, setShowFalKey] = useState(false);

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const openai = String(formData.get("openaiKey") || "").trim();
    const fal = String(formData.get("falKey") || "").trim();
    onSave(openai, fal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <form
        className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl animate-fade-in-scale"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/assets/openai.svg" alt="API" className="h-8 w-8 logo-white" />
            <h3 className="text-lg font-bold text-white">API Keys</h3>
          </div>
          <button
            className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* OpenAI Key */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                name="openaiKey"
                defaultValue={openaiDefault}
                placeholder="sk-..."
                type={showOpenAIKey ? "text" : "password"}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 pr-20"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-700 px-2 py-1 text-[10px] font-medium text-zinc-300 transition-all hover:bg-zinc-600"
                onClick={() => setShowOpenAIKey((prev) => !prev)}
              >
                {showOpenAIKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Required for image analysis and generation
            </p>
          </div>

          {/* fal.ai Key */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              fal.ai API Key
              <span className="ml-2 rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">
                Optional
              </span>
            </label>
            <div className="relative">
              <input
                name="falKey"
                defaultValue={falDefault}
                placeholder="fal_..."
                type={showFalKey ? "text" : "password"}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20 pr-20"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-700 px-2 py-1 text-[10px] font-medium text-zinc-300 transition-all hover:bg-zinc-600"
                onClick={() => setShowFalKey((prev) => !prev)}
              >
                {showFalKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Fallback provider for image/video generation
            </p>
          </div>
        </div>

        <button
          className="mt-6 w-full btn-glow rounded-xl px-4 py-3 text-sm font-bold text-white transition-all"
          type="submit"
        >
          Save keys
        </button>
      </form>
    </div>
  );
}
