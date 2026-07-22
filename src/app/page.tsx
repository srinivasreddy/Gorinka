"use client";

import { useEffect, useMemo, useState } from "react";
import rawCards from "@/data/cards.json";
import { loadState, saveState, nextState, type CardState, type Rating } from "@/lib/srs";

type Card = { front: string; back: string };

const cards: Card[] = (rawCards as Card[]).filter(
  (c) => c.front.replace(/<[^>]*>/g, "").trim().length > 0
);

export default function Home() {
  const [state, setState] = useState<Record<string, CardState>>({});
  const [queue, setQueue] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    const now = Date.now();
    const due = cards
      .map((_, i) => i)
      .filter((i) => {
        const s = loaded[cards[i].front];
        return !s || s.due <= now;
      });
    for (let i = due.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [due[i], due[j]] = [due[j], due[i]];
    }
    setQueue(due);
    setReady(true);
  }, []);

  const current = queue[pos] !== undefined ? cards[queue[pos]] : null;

  const dueCount = queue.length - pos;
  const totalKnown = useMemo(() => Object.keys(state).length, [state]);

  function rate(rating: Rating) {
    if (!current) return;
    const key = current.front;
    const updated = { ...state, [key]: nextState(state[key], rating) };
    setState(updated);
    saveState(updated);
    setRevealed(false);
    setPos((p) => p + 1);
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 px-4 py-10 font-sans">
      <div className="w-full max-w-xl">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          SAP-C02 Flashcards
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {current ? `${dueCount} due · ${totalKnown} studied` : `${totalKnown} studied`}
        </p>

        {current ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 min-h-[260px] flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <p
                className="text-lg font-medium text-zinc-900 dark:text-zinc-100"
                dangerouslySetInnerHTML={{ __html: current.front }}
              />
              {revealed && (
                <p
                  className="mt-4 text-base text-zinc-600 dark:text-zinc-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: current.back }}
                />
              )}
            </div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="mt-6 w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-medium hover:opacity-90 transition"
              >
                Show answer
              </button>
            ) : (
              <div className="mt-6 grid grid-cols-4 gap-2">
                <button
                  onClick={() => rate("again")}
                  className="rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 py-3 text-sm font-medium hover:opacity-80"
                >
                  Again
                </button>
                <button
                  onClick={() => rate("hard")}
                  className="rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 py-3 text-sm font-medium hover:opacity-80"
                >
                  Hard
                </button>
                <button
                  onClick={() => rate("good")}
                  className="rounded-xl bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 py-3 text-sm font-medium hover:opacity-80"
                >
                  Good
                </button>
                <button
                  onClick={() => rate("easy")}
                  className="rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 py-3 text-sm font-medium hover:opacity-80"
                >
                  Easy
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 text-center">
            <p className="text-zinc-700 dark:text-zinc-200 font-medium">
              No cards due right now.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Come back later, or clear your progress in the browser to restart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
