"use client";

import { useState, useRef, useCallback } from "react";
import { Asset, CarouselSlide } from "@/lib/types";

interface CarouselEditorProps {
  asset: Asset;
  onClose: () => void;
  onSave: (updatedSlides: CarouselSlide[]) => void;
  onExport: (slides: CarouselSlide[]) => void;
}

export function CarouselEditor({
  asset,
  onClose,
  onSave,
  onExport,
}: CarouselEditorProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(asset.slides || []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateSlideText = (
    index: number,
    field: "headline" | "body" | "cta",
    value: string
  ) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index
          ? {
              ...slide,
              textOverlay: {
                ...slide.textOverlay,
                [field]: value,
                position: slide.textOverlay?.position || "bottom",
                textColor: slide.textOverlay?.textColor || "#ffffff",
                fontSize: slide.textOverlay?.fontSize || "md",
              },
            }
          : slide
      )
    );
  };

  const updateSlideStyle = (
    index: number,
    field: "position" | "textColor" | "fontSize",
    value: string
  ) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index
          ? {
              ...slide,
              textOverlay: {
                ...slide.textOverlay,
                [field]: value,
              } as CarouselSlide["textOverlay"],
            }
          : slide
      )
    );
  };

  const exportSlide = useCallback(
    async (slide: CarouselSlide, index: number): Promise<Blob | null> => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Square format for carousel
      canvas.width = 1080;
      canvas.height = 1080;

      // Load and draw image
      const img = new Image();
      img.crossOrigin = "anonymous";

      return new Promise((resolve) => {
        img.onload = () => {
          // Draw image (cover fit)
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          // Draw text overlay
          if (slide.textOverlay) {
            const { headline, body, cta, position, textColor, fontSize } = slide.textOverlay;
            
            // Semi-transparent overlay for text readability
            const overlayHeight = 350;
            const overlayY = position === "top" ? 0 : canvas.height - overlayHeight;
            const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
            
            if (position === "top") {
              gradient.addColorStop(0, "rgba(0,0,0,0.7)");
              gradient.addColorStop(1, "rgba(0,0,0,0)");
            } else {
              gradient.addColorStop(0, "rgba(0,0,0,0)");
              gradient.addColorStop(1, "rgba(0,0,0,0.7)");
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, overlayY, canvas.width, overlayHeight);

            // Text settings
            ctx.fillStyle = textColor || "#ffffff";
            ctx.textAlign = "center";
            
            const fontSizeMap = { sm: 40, md: 56, lg: 72 };
            const baseFontSize = fontSizeMap[fontSize || "md"];
            
            let textY = position === "top" ? 80 : canvas.height - 200;

            // Headline
            if (headline) {
              ctx.font = `bold ${baseFontSize}px system-ui, -apple-system, sans-serif`;
              ctx.fillText(headline, canvas.width / 2, textY, canvas.width - 100);
              textY += baseFontSize + 20;
            }

            // Body
            if (body) {
              ctx.font = `${baseFontSize * 0.5}px system-ui, -apple-system, sans-serif`;
              // Word wrap
              const words = body.split(" ");
              let line = "";
              const maxWidth = canvas.width - 120;
              
              for (const word of words) {
                const testLine = line + word + " ";
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && line !== "") {
                  ctx.fillText(line, canvas.width / 2, textY);
                  line = word + " ";
                  textY += baseFontSize * 0.6;
                } else {
                  line = testLine;
                }
              }
              ctx.fillText(line, canvas.width / 2, textY);
              textY += baseFontSize * 0.6 + 10;
            }

            // CTA button
            if (cta) {
              const ctaFontSize = baseFontSize * 0.5;
              ctx.font = `bold ${ctaFontSize}px system-ui, -apple-system, sans-serif`;
              const ctaMetrics = ctx.measureText(cta);
              const ctaPadding = 30;
              const ctaWidth = ctaMetrics.width + ctaPadding * 2;
              const ctaHeight = ctaFontSize + ctaPadding;
              const ctaX = (canvas.width - ctaWidth) / 2;
              const ctaY = textY + 10;

              // Button background
              ctx.fillStyle = "#22c55e";
              ctx.beginPath();
              ctx.roundRect(ctaX, ctaY, ctaWidth, ctaHeight, 12);
              ctx.fill();

              // Button text
              ctx.fillStyle = "#ffffff";
              ctx.fillText(cta, canvas.width / 2, ctaY + ctaHeight / 2 + ctaFontSize / 3);
            }
          }

          // Add slide indicator dots
          const dotY = canvas.height - 40;
          const dotSpacing = 20;
          const totalDotsWidth = (slides.length - 1) * dotSpacing;
          const startX = (canvas.width - totalDotsWidth) / 2;

          slides.forEach((_, i) => {
            ctx.beginPath();
            ctx.arc(startX + i * dotSpacing, dotY, i === index ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = i === index ? "#ffffff" : "rgba(255,255,255,0.5)";
            ctx.fill();
          });

          canvas.toBlob((blob) => resolve(blob), "image/png", 1);
        };

        img.onerror = () => resolve(null);
        img.src = slide.imageUrl;
      });
    },
    [slides.length]
  );

  const handleExportAll = async () => {
    for (let i = 0; i < slides.length; i++) {
      const blob = await exportSlide(slides[i], i);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `carousel-slide-${i + 1}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
    onExport(slides);
  };

  const slide = slides[currentSlide];

  if (!slide) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <div className="text-white">No slides available</div>
      </div>
    );
  }

  const slideTypeLabels = {
    hook: "Hook",
    problem: "Problem",
    solution: "Solution",
    proof: "Proof",
    cta: "CTA",
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/95 backdrop-blur-md animate-fade-in">
      {/* Left: Preview */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-2xl">
          {/* Image */}
          <img
            src={slide.imageUrl}
            alt={`Slide ${currentSlide + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Text overlay preview */}
          {slide.textOverlay && (
            <div
              className={`absolute left-0 right-0 p-6 ${
                slide.textOverlay.position === "top"
                  ? "top-0 bg-gradient-to-b from-black/70 to-transparent"
                  : "bottom-0 bg-gradient-to-t from-black/70 to-transparent"
              }`}
              style={{ minHeight: "35%" }}
            >
              <div
                className={`flex flex-col gap-2 ${
                  slide.textOverlay.position === "top" ? "pt-4" : "pb-12"
                }`}
                style={{ color: slide.textOverlay.textColor || "#ffffff" }}
              >
                {slide.textOverlay.headline && (
                  <h2
                    className={`font-bold text-center ${
                      slide.textOverlay.fontSize === "sm"
                        ? "text-xl"
                        : slide.textOverlay.fontSize === "lg"
                        ? "text-4xl"
                        : "text-2xl"
                    }`}
                  >
                    {slide.textOverlay.headline}
                  </h2>
                )}
                {slide.textOverlay.body && (
                  <p className="text-sm text-center opacity-90">
                    {slide.textOverlay.body}
                  </p>
                )}
                {slide.textOverlay.cta && (
                  <button className="mx-auto mt-2 rounded-lg bg-green-500 px-6 py-2 text-sm font-bold text-white">
                    {slide.textOverlay.cta}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Slide indicator */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="w-96 border-l border-zinc-700 bg-zinc-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700 p-4">
          <div>
            <h3 className="text-base font-bold text-white">Carousel Editor</h3>
            <p className="text-xs text-zinc-500">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Slide tabs */}
        <div className="flex border-b border-zinc-700 overflow-x-auto">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(i)}
              className={`flex-1 min-w-0 px-3 py-2 text-xs font-medium transition-all ${
                i === currentSlide
                  ? "bg-zinc-800 text-white border-b-2 border-green-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {slideTypeLabels[s.slideType]}
            </button>
          ))}
        </div>

        {/* Editor form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Slide type badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
              {slideTypeLabels[slide.slideType]}
            </span>
            <span className="text-xs text-zinc-500">slide</span>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Headline
            </label>
            <input
              type="text"
              value={slide.textOverlay?.headline || ""}
              onChange={(e) => updateSlideText(currentSlide, "headline", e.target.value)}
              placeholder="Enter headline..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Body Text
            </label>
            <textarea
              value={slide.textOverlay?.body || ""}
              onChange={(e) => updateSlideText(currentSlide, "body", e.target.value)}
              placeholder="Optional supporting text..."
              rows={2}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none"
            />
          </div>

          {/* CTA */}
          {slide.slideType === "cta" && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                CTA Button
              </label>
              <input
                type="text"
                value={slide.textOverlay?.cta || ""}
                onChange={(e) => updateSlideText(currentSlide, "cta", e.target.value)}
                placeholder="Shop Now"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500"
              />
            </div>
          )}

          {/* Style options */}
          <div className="border-t border-zinc-700 pt-4 space-y-4">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Style Options
            </h4>

            {/* Position */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Text Position</label>
              <div className="flex gap-2">
                {(["top", "bottom"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateSlideStyle(currentSlide, "position", pos)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      slide.textOverlay?.position === pos
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Font Size</label>
              <div className="flex gap-2">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSlideStyle(currentSlide, "fontSize", size)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      slide.textOverlay?.fontSize === size
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Text color */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">Text Color</label>
              <div className="flex gap-2">
                {["#ffffff", "#000000", "#22c55e", "#f59e0b"].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSlideStyle(currentSlide, "textColor", color)}
                    className={`h-8 w-8 rounded-lg border-2 transition-all ${
                      slide.textOverlay?.textColor === color
                        ? "border-green-500 scale-110"
                        : "border-zinc-700"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-zinc-700 p-4 space-y-2">
          <button
            onClick={handleExportAll}
            className="w-full btn-glow rounded-xl py-3 text-sm font-bold text-white"
          >
            Export All Slides
          </button>
          <button
            onClick={() => {
              onSave(slides);
              onClose();
            }}
            className="w-full rounded-xl border border-zinc-600 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Save & Close
          </button>
        </div>
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
