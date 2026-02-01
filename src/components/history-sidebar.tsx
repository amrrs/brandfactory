"use client";

import { HistoryItem } from "@/lib/types";

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function HistorySidebar({
  history,
  onSelect,
  onDelete,
  onClose,
}: HistorySidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-96 border-l border-zinc-700 bg-zinc-900 shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-zinc-700 p-5">
          <h3 className="text-base font-bold text-white">History</h3>
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
        
        <div className="p-5 space-y-3 overflow-y-auto h-[calc(100%-73px)]">
          {history.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-zinc-500">No history yet</p>
              <p className="text-xs text-zinc-600 mt-1">Generated assets will appear here</p>
            </div>
          )}
          
          {history.map((item, index) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-3 transition-all hover:border-zinc-600 hover:bg-zinc-800"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                {item.thumbnail || item.url ? (
                  <img
                    src={item.thumbnail || item.url}
                    alt=""
                    className="h-full w-full object-cover transition-all group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {item.brandName || item.description || "Generation"}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {item.summary ?? new Date(item.createdAt).toLocaleString()}
                </div>
                {item.adCopyHeadline && (
                  <div className="text-xs text-zinc-400 mt-1 truncate italic">
                    "{item.adCopyHeadline}"
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <button
                  className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-green-500"
                  onClick={() => onSelect(item)}
                  type="button"
                >
                  Open
                </button>
                <button
                  className="rounded-lg bg-zinc-700/50 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:bg-red-500/20 hover:text-red-400"
                  onClick={() => onDelete(item.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
