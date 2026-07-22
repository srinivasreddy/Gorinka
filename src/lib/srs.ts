export type Rating = "again" | "hard" | "good" | "easy";

export interface CardProgress {
  interval: number; // days until next review
  ease: number; // ease factor, higher = intervals grow faster
  due: number; // epoch ms when this card is next due
  reps: number; // consecutive successful reviews
}

type ProgressMap = Record<string, CardProgress>;

const STORAGE_KEY = "sap-c02-srs-state";
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;

export function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isDue(progress: CardProgress | undefined, now = Date.now()): boolean {
  return !progress || progress.due <= now;
}

export function schedule(progress: CardProgress | undefined, rating: Rating): CardProgress {
  const ease = progress?.ease ?? DEFAULT_EASE;

  if (rating === "again") {
    return { interval: 0, ease: Math.max(MIN_EASE, ease - 0.2), due: Date.now(), reps: 0 };
  }

  const reps = progress?.reps ?? 0;
  const interval = nextInterval(reps, progress?.interval ?? 1, ease, rating);
  const nextEase =
    rating === "hard" ? Math.max(MIN_EASE, ease - 0.15) : rating === "easy" ? ease + 0.15 : ease;

  return {
    interval,
    ease: nextEase,
    due: Date.now() + interval * DAY_MS,
    reps: reps + 1,
  };
}

function nextInterval(reps: number, prevInterval: number, ease: number, rating: Rating): number {
  if (reps === 0) return rating === "easy" ? 3 : 1;
  if (reps === 1) return rating === "easy" ? 6 : rating === "hard" ? 2 : 4;

  const factor = rating === "hard" ? 1.2 : rating === "easy" ? ease * 1.3 : ease;
  return Math.round(prevInterval * factor);
}
