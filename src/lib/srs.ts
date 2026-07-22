export type Rating = "again" | "hard" | "good" | "easy";

export type CardState = {
  interval: number; // days
  ease: number;
  due: number; // epoch ms
  reps: number;
};

const STORAGE_KEY = "sap-c02-srs-state";

export function loadState(): Record<string, CardState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveState(state: Record<string, CardState>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const DAY = 24 * 60 * 60 * 1000;

export function nextState(prev: CardState | undefined, rating: Rating): CardState {
  const ease = prev?.ease ?? 2.5;
  const reps = prev?.reps ?? 0;

  if (rating === "again") {
    return { interval: 0, ease: Math.max(1.3, ease - 0.2), due: Date.now(), reps: 0 };
  }

  let interval: number;
  if (reps === 0) {
    interval = rating === "easy" ? 3 : 1;
  } else if (reps === 1) {
    interval = rating === "easy" ? 6 : rating === "hard" ? 2 : 4;
  } else {
    const prevInterval = prev?.interval ?? 1;
    const factor = rating === "hard" ? 1.2 : rating === "easy" ? ease * 1.3 : ease;
    interval = Math.round(prevInterval * factor);
  }

  const newEase =
    rating === "hard" ? Math.max(1.3, ease - 0.15) : rating === "easy" ? ease + 0.15 : ease;

  return {
    interval,
    ease: newEase,
    due: Date.now() + interval * DAY,
    reps: reps + 1,
  };
}
