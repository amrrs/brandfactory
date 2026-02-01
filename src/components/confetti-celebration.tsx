"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiCelebration({ trigger, onComplete }: ConfettiCelebrationProps) {
  const fireConfetti = useCallback(() => {
    // First burst - center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#10b981", "#34d399", "#6ee7b7", "#ffffff"],
    });

    // Left side burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#22c55e", "#3b82f6", "#8b5cf6"],
      });
    }, 150);

    // Right side burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#22c55e", "#3b82f6", "#8b5cf6"],
      });
    }, 300);

    // Final celebration burst
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.7 },
        colors: ["#fbbf24", "#f59e0b", "#22c55e"],
      });
      onComplete?.();
    }, 500);
  }, [onComplete]);

  useEffect(() => {
    if (trigger) {
      fireConfetti();
    }
  }, [trigger, fireConfetti]);

  return null;
}

// Standalone function to fire confetti from anywhere
export function celebrateSuccess() {
  const colors = ["#22c55e", "#10b981", "#3b82f6", "#8b5cf6", "#fbbf24"];
  
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.65 },
    colors,
  });
}
