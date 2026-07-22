"use client";

import { useEffect } from "react";
import type { Rating } from "@/lib/srs";

const RATING_KEYS: Record<string, Rating> = {
  "1": "again",
  "2": "hard",
  "3": "good",
  "4": "easy",
};

interface KeyboardShortcutsOptions {
  revealed: boolean;
  isHistory: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
  onGoBack: () => void;
  onGoForward: () => void;
}

export function useKeyboardShortcuts({
  revealed,
  isHistory,
  canGoBack,
  canGoForward,
  onReveal,
  onRate,
  onGoBack,
  onGoForward,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "ArrowLeft") {
        if (canGoBack) {
          event.preventDefault();
          onGoBack();
        }
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isHistory) {
          if (canGoForward) onGoForward();
        } else if (!revealed) {
          onReveal();
        } else {
          onRate("good");
        }
        return;
      }

      if (isHistory) return;

      if (!revealed) {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          onReveal();
        }
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onRate("good");
        return;
      }

      const rating = RATING_KEYS[event.key];
      if (rating) {
        event.preventDefault();
        onRate(rating);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, isHistory, canGoBack, canGoForward, onReveal, onRate, onGoBack, onGoForward]);
}
