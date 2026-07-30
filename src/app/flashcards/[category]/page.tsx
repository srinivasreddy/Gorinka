"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
import { getCategory, findCardByFront } from "@/lib/cards";
import type { Rating } from "@/lib/srs";
import type { Card as CardData } from "@/lib/cards";

export default function CategoryFlashcardsPage() {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.category;
  const category = getCategory(slug);
  const cards = category?.cards ?? [];

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
    resetCategory,
  } = useStudyQueue(slug, cards);
  const [revealed, setRevealed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useCardSearch(searchQuery, cards);
  const isSearching = searchQuery.trim().length > 0;

  // A stack of cards reached via search or via in-card "see also" hyperlinks
  // -- reviewed independently of the due-queue position, but still through
  // the same reveal/rate interaction. Drilling into a link pushes onto the
  // stack; Back pops one level, landing on the parent card (already
  // revealed) rather than exiting straight back to the search results.
  const [lookupStack, setLookupStack] = useState<CardData[]>([]);
  const [lookupRevealed, setLookupRevealed] = useState(false);
  const lookupCard = lookupStack[lookupStack.length - 1] ?? null;
  const isLookup = lookupCard !== null;

  function startLookup(card: CardData) {
    setLookupStack([card]);
    setLookupRevealed(false);
  }

  function pushLookup(front: string) {
    const target = findCardByFront(front);
    if (!target) return;
    setLookupStack((stack) => [...stack, target]);
    setLookupRevealed(false);
  }

  function popLookup() {
    setLookupStack((stack) => stack.slice(0, -1));
    setLookupRevealed(true);
  }

  // Lets a link from outside the flashcards section (e.g. an MCQ question)
  // deep-link straight to one card via /flashcards/[category]?card=<front>,
  // reusing the same lookup stack as an in-card "see also" link or search
  // result. The param is stripped right after so it doesn't re-trigger on
  // back/forward navigation within this page.
  const cardParam = searchParams.get("card");
  useEffect(() => {
    if (!cardParam) return;
    const target = findCardByFront(cardParam);
    // Deep-linking into a specific card via URL is exactly the kind of
    // external-system sync effects are for -- there's no user event to hang
    // this off, since it must fire on initial load too.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (target) startLookup(target);
    router.replace(`/flashcards/${slug}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardParam]);

  function handleRate(rating: Rating) {
    rate(rating);
    setRevealed(false);
  }

  function handleLookupRate(rating: Rating) {
    if (!lookupCard) return;
    rateCard(lookupCard, rating);
    popLookup();
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
    if (isLookup) popLookup();
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

  if (!category) {
    return (
      <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
        <div className="w-full max-w-xl">
          <Link
            href="/flashcards"
            className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← All categories
          </Link>
          <Card>
            <CardContent className="text-center">
              <p className="font-medium text-foreground">Category not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div className="flex flex-1 flex-col items-center bg-muted/30 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <Link
          href="/flashcards"
          className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← All categories
        </Link>
        <h1 className="mb-1 text-xl font-semibold text-foreground">{category.title}</h1>
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
              onSelect={startLookup}
            />
          </div>
        )}

        {isLookup && (
          <Button
            variant="ghost"
            size="sm"
            onClick={popLookup}
            className="mb-4 -ml-2 text-muted-foreground"
          >
            <ArrowLeft />
            {lookupStack.length > 1 ? "Back" : "Back to results"}
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
                onCardLink={pushLookup}
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
                Come back later, or reset this category&apos;s progress to restart it.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  if (
                    window.confirm(
                      `Reset all progress for "${category.title}"? This can't be undone.`
                    )
                  ) {
                    resetCategory();
                  }
                }}
              >
                Reset progress for {category.title}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
