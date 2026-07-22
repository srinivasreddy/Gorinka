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
  onReveal: () => void;
  onRate: (rating: Rating) => void;
}

export function useKeyboardShortcuts({ revealed, onReveal, onRate }: KeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

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
  }, [revealed, onReveal, onRate]);
}
