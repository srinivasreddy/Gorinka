"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Rating } from "@/lib/srs";

const RATING_STYLES: Record<Rating, string> = {
  again:
    "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900",
  hard: "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900",
  good: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900",
  easy: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900",
};

const RATING_LABELS: Record<Rating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

const RATING_KEYS: Record<Rating, string> = {
  again: "1",
  hard: "2",
  good: "3",
  easy: "4",
};

const RATINGS: Rating[] = ["again", "hard", "good", "easy"];

interface FlashcardProps {
  front: string;
  back: string;
  revealed: boolean;
  isHistory: boolean;
  canGoForward: boolean;
  onReveal: () => void;
  onRate: (rating: Rating) => void;
  onGoForward: () => void;
}

export function Flashcard({
  front,
  back,
  revealed,
  isHistory,
  canGoForward,
  onReveal,
  onRate,
  onGoForward,
}: FlashcardProps) {
  return (
    <Card className="min-h-65">
      <CardContent className="flex h-full flex-col">
        {isHistory && (
          <Badge variant="secondary" className="mb-4 w-fit">
            Reviewing previous card
          </Badge>
        )}
        <div className="flex flex-1 flex-col justify-center">
          <p
            className="text-lg font-medium text-foreground"
            dangerouslySetInnerHTML={{ __html: front }}
          />
          {revealed && (
            <p
              className="mt-4 text-base leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: back }}
            />
          )}
        </div>

        {isHistory ? (
          <Button
            onClick={onGoForward}
            disabled={!canGoForward}
            size="lg"
            className="mt-6 h-11 w-full"
          >
            Continue <span className="opacity-60 font-normal">(→)</span>
          </Button>
        ) : !revealed ? (
          <Button onClick={onReveal} size="lg" className="mt-6 w-full">
            Show answer <span className="opacity-60 font-normal">(Space)</span>
          </Button>
        ) : (
          <div className="mt-6 grid grid-cols-4 gap-2">
            {RATINGS.map((rating) => (
              <Button
                key={rating}
                onClick={() => onRate(rating)}
                size="lg"
                className={RATING_STYLES[rating]}
              >
                {RATING_LABELS[rating]}{" "}
                <span className="opacity-60">({RATING_KEYS[rating]})</span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
