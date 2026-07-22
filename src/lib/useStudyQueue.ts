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
  const [position, setPosition] = useState(0);

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

  const currentCard = queue[position] !== undefined ? cards[queue[position]] : null;
  const dueCount = queue.length - position;
  const studiedCount = Object.keys(progress).length;

  function rate(rating: Rating) {
    if (!currentCard || !loaded) return;
    const key = currentCard.front;
    const updatedProgress = { ...progress, [key]: schedule(progress[key], rating) };
    saveProgress(updatedProgress);
    setLoaded({ ...loaded, progress: updatedProgress });
    setPosition((p) => p + 1);
  }

  return { ready, currentCard, dueCount, studiedCount, rate };
}
