"use client";

import { EngagementAnalysis } from "@/lib/types";
import { Sparkles, TrendingUp, Lightbulb, Target } from "lucide-react";

interface EngagementAnalyzerProps {
  analysis: EngagementAnalysis | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  hasImage: boolean;
  imagePreview?: string;
}

export function EngagementAnalyzer({
  analysis,
  isAnalyzing,
  onAnalyze,
  hasImage,
  imagePreview,
}: EngagementAnalyzerProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-400" />
            Engagement Predictor
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            AI-powered platform performance analysis
          </p>
        </div>
        <button
          onClick={onAnalyze}
          disabled={!hasImage || isAnalyzing}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            !hasImage || isAnalyzing
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze"
          )}
        </button>
      </div>

      {/* Image preview with scanning effect */}
      {imagePreview && (
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-48 object-cover"
            />
            
            {/* Scanning overlay when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0">
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Scanning line */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan shadow-[0_0_20px_rgba(34,197,94,0.8)]" />
                </div>
                
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `
                    linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }} />
                
                {/* Corner markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-green-400" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-green-400" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-green-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-green-400" />
                
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-green-400 text-sm font-bold tracking-wider animate-pulse">
                    ANALYZING IMAGE
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && !imagePreview && (
        <div className="text-center py-12 text-zinc-600">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Upload an image and click Analyze to predict engagement</p>
        </div>
      )}

      {isAnalyzing && !imagePreview && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-green-400">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">Analyzing engagement potential...</span>
          </div>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Overall Score Gauge */}
          <div className="relative">
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Overall Score
              </div>
              <GaugeMeter score={analysis.overallScore} />
            </div>
            <p className="text-sm text-zinc-400 text-center italic">
              {analysis.keyInsights}
            </p>
          </div>

          {/* Platform Predictions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Platform Rankings
              </h4>
            </div>
            <div className="space-y-3">
              {analysis.platformPredictions.map((pred, idx) => (
                <div
                  key={pred.platform}
                  className={`rounded-lg border p-3 transition-all ${
                    idx === 0
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-zinc-800 bg-zinc-900/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {pred.platform}
                      </span>
                      {idx === 0 && (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
                          BEST
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-white">
                      {pred.score}
                      <span className="text-xs text-zinc-500">/100</span>
                    </span>
                  </div>
                  <div className="mb-2 h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreColor(pred.score)}`}
                      style={{ width: `${pred.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">{pred.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-green-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Strengths
              </h4>
            </div>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          {analysis.improvements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Improvements
                </h4>
              </div>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-amber-400 mt-0.5">→</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GaugeMeter({ score }: { score: number }) {
  // Calculate rotation for semi-circle gauge (-90 to 90 degrees)
  const rotation = -90 + (score / 100) * 180;
  
  return (
    <div className="relative w-48 h-24 mx-auto">
      {/* Background arc */}
      <svg className="w-full h-full" viewBox="0 0 200 100">
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="#27272a"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Colored arc based on score */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke={`url(#gradient-${score})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 251} 251`}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        {/* Needle */}
        <line
          x1="100"
          y1="90"
          x2="100"
          y2="30"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            transformOrigin: "100px 90px",
            transform: `rotate(${rotation}deg)`,
            transition: "transform 1s ease-out",
          }}
        />
        {/* Center dot */}
        <circle cx="100" cy="90" r="6" fill="white" />
      </svg>
      
      {/* Score display */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs text-zinc-500 uppercase tracking-wider">
          Engagement Score
        </span>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}
