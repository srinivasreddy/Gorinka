"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Flashcard } from "@/components/Flashcard";
import { CardSearch } from "@/components/CardSearch";
import { CardNavControls } from "@/components/CardNavControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudyQueue } from "@/lib/useStudyQueue";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { useSwipeGesture } from "@/lib/useSwipeGesture";
import { useCardSearch } from "@/lib/useCardSearch";
import type { Rating } from "@/lib/srs";
import type { Card as CardData } from "@/lib/cards";

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
    rateCard,
    goBack,
    goForward,
  } = useStudyQueue();
  const [revealed, setRevealed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useCardSearch(searchQuery);
  const isSearching = searchQuery.trim().length > 0;

  // A card jumped to from search — reviewed independently of the due-queue
  // position, but still through the same reveal/rate interaction.
  const [lookupCard, setLookupCard] = useState<CardData | null>(null);
  const [lookupRevealed, setLookupRevealed] = useState(false);
  const isLookup = lookupCard !== null;

  function returnToResults() {
    setLookupCard(null);
    setLookupRevealed(false);
  }

  function handleRate(rating: Rating) {
    rate(rating);
    setRevealed(false);
  }

  function handleLookupRate(rating: Rating) {
    if (!lookupCard) return;
    rateCard(lookupCard, rating);
    returnToResults();
  }

  const activeCard = isLookup ? lookupCard : isSearching ? null : currentCard;
  const activeRevealed = isLookup ? lookupRevealed : revealed;
  const activeIsHistory = isLookup ? false : isHistory;
  const activeCanGoBack = isLookup ? true : isSearching ? false : canGoBack;
  const activeCanGoForward = isLookup ? false : isSearching ? false : canGoForward;

  function activeOnReveal() {
    if (isLookup) setLookupRevealed(true);
    else setRevealed(true);
  }

  function activeOnRate(rating: Rating) {
    if (isLookup) handleLookupRate(rating);
    else handleRate(rating);
  }

  function activeGoBack() {
    if (isLookup) returnToResults();
    else if (!isSearching) goBack();
  }

  function activeGoForward() {
    if (!isLookup && !isSearching) goForward();
  }

  useKeyboardShortcuts({
    revealed: activeRevealed,
    isHistory: activeIsHistory,
    canGoBack: activeCanGoBack,
    canGoForward: activeCanGoForward,
    onReveal: activeOnReveal,
    onRate: activeOnRate,
    onGoBack: activeGoBack,
    onGoForward: activeGoForward,
  });

  // Mirrors the right-arrow keyboard shortcut: reveal, then advance with a
  // Good rating (or step forward through history) -- shared by the swipe
  // gesture and the visible nav button below, for mouse/touch users without
  // a keyboard.
  function activeAdvance() {
    if (activeIsHistory) {
      if (activeCanGoForward) activeGoForward();
    } else if (!activeRevealed) {
      activeOnReveal();
    } else {
      activeOnRate("good");
    }
  }

  const swipeHandlers = useSwipeGesture({
    onSwipeRight: activeAdvance,
    onSwipeLeft: () => {
      if (activeCanGoBack) activeGoBack();
    },
  });

  if (!ready) return null;

  return (
    <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="mb-1 text-xl font-semibold text-foreground">SAP-C02 Flashcards</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          {currentCard ? `${dueCount} due · ${studiedCount} studied` : `${studiedCount} studied`}
          {canGoBack && !isSearching && !isLookup && (
            <span className="opacity-60"> · ← previous card</span>
          )}
        </p>

        {!isLookup && (
          <div className="mb-6">
            <CardSearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
              results={searchResults}
              onSelect={(card) => {
                setLookupCard(card);
                setLookupRevealed(false);
              }}
            />
          </div>
        )}

        {isLookup && (
          <Button
            variant="ghost"
            size="sm"
            onClick={returnToResults}
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <ArrowLeft />
            Back to results
          </Button>
        )}

        {isLookup || (!isSearching && currentCard) ? (
          <div>
            <div {...swipeHandlers}>
              <Flashcard
                front={activeCard!.front}
                back={activeCard!.back}
                revealed={activeIsHistory || activeRevealed}
                isHistory={activeIsHistory}
                onRate={activeOnRate}
              />
            </div>
            <CardNavControls
              canGoBack={activeCanGoBack}
              canGoForward={!activeIsHistory || activeCanGoForward}
              onBack={activeGoBack}
              onForward={activeAdvance}
            />
          </div>
        ) : !isSearching ? (
          <Card>
            <CardContent className="text-center">
              <p className="font-medium text-foreground">No cards due right now.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Come back later, or clear your browser storage to restart.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
