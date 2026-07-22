"use client";

import type { Rating } from "@/lib/srs";

const RATING_STYLES: Record<Rating, string> = {
  again: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300",
  hard: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  good: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300",
  easy: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
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
  onReveal: () => void;
  onRate: (rating: Rating) => void;
}

export function Flashcard({ front, back, revealed, onReveal, onRate }: FlashcardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 min-h-[260px] flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <p
          className="text-lg font-medium text-zinc-900 dark:text-zinc-100"
          dangerouslySetInnerHTML={{ __html: front }}
        />
        {revealed && (
          <p
            className="mt-4 text-base text-zinc-600 dark:text-zinc-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: back }}
          />
        )}
      </div>

      {!revealed ? (
        <button
          onClick={onReveal}
          className="mt-6 w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-medium hover:opacity-90 transition"
        >
          Show answer <span className="opacity-60 font-normal">(Space)</span>
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-4 gap-2">
          {RATINGS.map((rating) => (
            <button
              key={rating}
              onClick={() => onRate(rating)}
              className={`rounded-xl py-3 text-sm font-medium hover:opacity-80 ${RATING_STYLES[rating]}`}
            >
              {RATING_LABELS[rating]}{" "}
              <span className="opacity-60">({RATING_KEYS[rating]})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
