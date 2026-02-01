"use client";

import { DebugLogEntry } from "@/hooks/use-debug-logs";

interface DebugLogPanelProps {
  open: boolean;
  logs: DebugLogEntry[];
  onClose: () => void;
  onClear: () => void;
}

export function DebugLogPanel({ open, logs, onClose, onClear }: DebugLogPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl animate-fade-in-scale">
        <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Developer Logs</div>
              <div className="text-xs text-zinc-500">Latest first</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-700"
              onClick={onClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white"
              onClick={onClose}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-4 max-h-[60vh] space-y-2 overflow-auto text-xs font-mono">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-zinc-500">No logs yet</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`rounded-lg border px-4 py-3 ${
                  log.level === "error"
                    ? "border-red-500/30 bg-red-500/10"
                    : "border-zinc-700 bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      log.level === "error"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-zinc-700 text-zinc-400"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`mt-1 ${log.level === "error" ? "text-red-300" : "text-zinc-300"}`}>
                  {log.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
