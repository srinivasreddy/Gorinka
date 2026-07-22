"use client";

import { useState } from "react";
import { Flashcard } from "@/components/Flashcard";
import { useStudyQueue } from "@/lib/useStudyQueue";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import type { Rating } from "@/lib/srs";

export default function Home() {
  const {
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
  } = useStudyQueue();
  const [revealed, setRevealed] = useState(false);

  function handleRate(rating: Rating) {
    rate(rating);
    setRevealed(false);
  }

  useKeyboardShortcuts({
    revealed,
    isHistory,
    canGoBack,
    canGoForward,
    onReveal: () => setRevealed(true),
    onRate: handleRate,
    onGoBack: goBack,
    onGoForward: goForward,
  });

  if (!ready) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          SAP-C02 Flashcards
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {currentCard ? `${dueCount} due · ${studiedCount} studied` : `${studiedCount} studied`}
          {canGoBack && (
            <span className="opacity-60"> · ← previous card</span>
          )}
        </p>

        {currentCard ? (
          <Flashcard
            front={currentCard.front}
            back={currentCard.back}
            revealed={isHistory || revealed}
            isHistory={isHistory}
            canGoForward={canGoForward}
            onReveal={() => setRevealed(true)}
            onRate={handleRate}
            onGoForward={goForward}
          />
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 text-center">
            <p className="text-zinc-700 dark:text-zinc-200 font-medium">
              No cards due right now.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Come back later, or clear your browser storage to restart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
