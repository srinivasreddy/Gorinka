"use client";

import { useState } from "react";
import { Flashcard } from "@/components/Flashcard";
import { Card, CardContent } from "@/components/ui/card";
import { useStudyQueue } from "@/lib/useStudyQueue";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import type { Rating } from "@/lib/srs";

export default function FlashcardsPage() {
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
    <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 Flashcards</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {currentCard ? `${dueCount} due · ${studiedCount} studied` : `${studiedCount} studied`}
          {canGoBack && <span className="opacity-60"> · ← previous card</span>}
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
          <Card>
            <CardContent className="text-center">
              <p className="font-medium text-foreground">No cards due right now.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Come back later, or clear your browser storage to restart.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
