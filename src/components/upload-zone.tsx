"use client";

import { MAX_UPLOADS } from "@/lib/constants";
import { useRef, useState } from "react";

interface UploadZoneProps {
  files: File[];
  previews: string[];
  onFilesSelected: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export function UploadZone({
  files,
  previews,
  onFilesSelected,
  onRemove,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList).slice(0, MAX_UPLOADS);
    onFilesSelected(next);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleZoneClick = () => {
    if (previews.length === 0) {
      inputRef.current?.click();
    }
  };

  const hasImage = previews.length > 0;

  // Compact view when image is uploaded
  if (hasImage) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-zinc-700/50 bg-zinc-900/30 p-3 backdrop-blur-sm">
        {/* Thumbnail with glow */}
        <div className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-green-500/30 bg-zinc-900 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <img
            src={previews[0]}
            alt={files[0]?.name || "uploaded"}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-all group-hover:opacity-100"
            onClick={() => onRemove(0)}
            aria-label="Remove image"
          >
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{files[0]?.name || "Uploaded image"}</p>
          <p className="text-[10px] text-zinc-500">Click thumbnail to remove</p>
        </div>
        
        {/* Change button */}
        <button
          className="rounded-lg border border-zinc-600/50 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          Change
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
    );
  }

  // Empty state - enhanced drop zone
  return (
    <div
      className={`group relative rounded-xl border-2 border-dashed p-5 transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragging
          ? "border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
          : "border-zinc-700/50 bg-zinc-900/30 hover:border-green-500/50 hover:bg-zinc-900/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={handleZoneClick}
    >
      {/* Animated corner accents */}
      <div className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg transition-all ${isDragging ? "border-green-500" : "border-transparent group-hover:border-green-500/50"}`} />
      <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg transition-all ${isDragging ? "border-green-500" : "border-transparent group-hover:border-green-500/50"}`} />
      <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg transition-all ${isDragging ? "border-green-500" : "border-transparent group-hover:border-green-500/50"}`} />
      <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg transition-all ${isDragging ? "border-green-500" : "border-transparent group-hover:border-green-500/50"}`} />
      
      <div className="flex items-center gap-4 relative z-10">
        {/* Icon with gradient background */}
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 transition-all group-hover:border-green-500/30 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] ${isDragging ? "animate-icon-float border-green-500/50" : ""}`}>
          <svg className={`h-5 w-5 transition-colors ${isDragging ? "text-green-400" : "text-zinc-400 group-hover:text-green-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        
        {/* Text */}
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Upload brand image</p>
          <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">Drop an image or click to browse</p>
        </div>
        
        {/* Button with glow */}
        <button
          className="rounded-lg bg-gradient-to-r from-white to-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          type="button"
        >
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
    </div>
  );
}
