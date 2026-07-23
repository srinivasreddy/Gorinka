"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cards } from "@/lib/cards";
import { isDue, loadProgress, saveProgress, schedule, type CardProgress, type Rating } from "@/lib/srs";
import type { Card } from "@/lib/cards";

export type { Card } from "@/lib/cards";

const STUDY_QUEUE_KEY = ["study-queue"] as const;

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

// localStorage doesn't exist during SSR, so this can only run client-side,
// as a query — not read directly during initial render.
function loadStudyQueue(): LoadedState {
  const progress = loadProgress();
  const dueIndices = cards
    .map((_, i) => i)
    .filter((i) => isDue(progress[cards[i].front]));
  return { progress, queue: shuffled(dueIndices) };
}

export function useStudyQueue() {
  const queryClient = useQueryClient();
  const { data: loaded, isSuccess } = useQuery({
    queryKey: STUDY_QUEUE_KEY,
    queryFn: loadStudyQueue,
    staleTime: Infinity,
  });

  // `frontier` is how many cards have been rated so far — the boundary
  // between already-rated history and the next unrated card.
  const [frontier, setFrontier] = useState(0);
  // `cursor` is the card currently on screen; it can sit anywhere from 0
  // up to `frontier` (viewing history) to show the live, unrated card.
  const [cursor, setCursor] = useState(0);

  const rateMutation = useMutation({
    mutationFn: async (updatedProgress: Record<string, CardProgress>) => {
      saveProgress(updatedProgress);
      return updatedProgress;
    },
    onSuccess: (updatedProgress) => {
      queryClient.setQueryData(STUDY_QUEUE_KEY, (old: LoadedState | undefined) =>
        old ? { ...old, progress: updatedProgress } : old
      );
    },
  });

  const ready = isSuccess;
  const progress = loaded?.progress ?? {};
  const queue = loaded?.queue ?? [];

  const isHistory = cursor < frontier;
  const currentCard = queue[cursor] !== undefined ? cards[queue[cursor]] : null;
  const dueCount = queue.length - frontier;
  const studiedCount = Object.keys(progress).length;
  // Back never dead-ends: at the oldest rated card it wraps to the newest
  // (live) position instead of disabling, as long as there's anything rated
  // yet to wrap through.
  const canGoBack = frontier > 0;
  const canGoForward = isHistory;

  // Rates an arbitrary card's SRS progress without touching the due-queue
  // position -- used for ad hoc lookups (e.g. jumping to a card via search)
  // that aren't part of the current review session.
  function rateCard(card: Card, rating: Rating) {
    if (!loaded) return;
    const key = card.front;
    const updatedProgress = { ...progress, [key]: schedule(progress[key], rating) };
    rateMutation.mutate(updatedProgress);
  }

  function rate(rating: Rating) {
    if (!currentCard || isHistory) return;
    rateCard(currentCard, rating);
    setFrontier((f) => f + 1);
    setCursor((c) => c + 1);
  }

  function goBack() {
    setCursor((c) => (c === 0 ? frontier : c - 1));
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
    rateCard,
    goBack,
    goForward,
  };
}
