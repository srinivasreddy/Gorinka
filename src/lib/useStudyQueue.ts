"use client";

import { useEffect, useMemo, useState } from "react";
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

export function useStudyQueue() {
  const [progress, setProgress] = useState<Record<string, CardProgress>>({});
  const [queue, setQueue] = useState<number[]>([]);
  const [position, setPosition] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
    const dueIndices = cards
      .map((_, i) => i)
      .filter((i) => isDue(loaded[cards[i].front]));
    setQueue(shuffled(dueIndices));
    setReady(true);
  }, []);

  const currentCard = queue[position] !== undefined ? cards[queue[position]] : null;
  const dueCount = queue.length - position;
  const studiedCount = useMemo(() => Object.keys(progress).length, [progress]);

  function rate(rating: Rating) {
    if (!currentCard) return;
    const key = currentCard.front;
    const updated = { ...progress, [key]: schedule(progress[key], rating) };
    setProgress(updated);
    saveProgress(updated);
    setPosition((p) => p + 1);
  }

  return { ready, currentCard, dueCount, studiedCount, rate };
}
