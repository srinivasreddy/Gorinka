"use client";

import { useEffect, useState } from "react";
import cardsData from "@/data/cards.json";
import { isDue, loadProgress, saveProgress, schedule, type CardProgress, type Rating } from "@/lib/srs";

export interface Card {
  front: string;
  back: string;
}

const cards: Card[] = (cardsData as Card[]).filter(
  (card) => card.front.replace(/<[^>]*>/g, "").trim().length > 0
);

function shuffled(indices: number[]): number[] {
  const result = [...indices];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface LoadedState {
  progress: Record<string, CardProgress>;
  queue: number[];
}

export function useStudyQueue() {
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  // `frontier` is how many cards have been rated so far — the boundary
  // between already-rated history and the next unrated card.
  const [frontier, setFrontier] = useState(0);
  // `cursor` is the card currently on screen; it can sit anywhere from 0
  // up to `frontier` (viewing history) to show the live, unrated card.
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const progress = loadProgress();
    const dueIndices = cards
      .map((_, i) => i)
      .filter((i) => isDue(progress[cards[i].front]));
    // localStorage doesn't exist during SSR, so this can't be read during
    // initial render without a hydration mismatch — an effect is required.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded({ progress, queue: shuffled(dueIndices) });
  }, []);

  const ready = loaded !== null;
  const progress = loaded?.progress ?? {};
  const queue = loaded?.queue ?? [];

  const isHistory = cursor < frontier;
  const currentCard = queue[cursor] !== undefined ? cards[queue[cursor]] : null;
  const dueCount = queue.length - frontier;
  const studiedCount = Object.keys(progress).length;
  const canGoBack = cursor > 0;
  const canGoForward = isHistory;

  function rate(rating: Rating) {
    if (!currentCard || !loaded || isHistory) return;
    const key = currentCard.front;
    const updatedProgress = { ...progress, [key]: schedule(progress[key], rating) };
    saveProgress(updatedProgress);
    setLoaded({ ...loaded, progress: updatedProgress });
    setFrontier((f) => f + 1);
    setCursor((c) => c + 1);
  }

  function goBack() {
    setCursor((c) => Math.max(0, c - 1));
  }

  function goForward() {
    setCursor((c) => Math.min(frontier, c + 1));
  }

  return {
    ready,
    currentCard,
    dueCount,
    studiedCount,
    isHistory,
    canGoBack,
    canGoForward,
    rate,
    goBack,
    goForward,
  };
}
