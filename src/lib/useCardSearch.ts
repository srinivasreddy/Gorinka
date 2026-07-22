"use client";

import { useMemo } from "react";
import { cards, stripHtml, type Card } from "@/lib/cards";

export function useCardSearch(query: string): Card[] {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cards.filter(
      (card) =>
        stripHtml(card.front).toLowerCase().includes(q) ||
        stripHtml(card.back).toLowerCase().includes(q)
    );
  }, [query]);
}
