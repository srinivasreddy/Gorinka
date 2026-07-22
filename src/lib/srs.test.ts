import { describe, expect, it } from "vitest";
import { isDue, schedule } from "@/lib/srs";

describe("isDue", () => {
  it("treats a card with no progress as due", () => {
    expect(isDue(undefined)).toBe(true);
  });

  it("is due once the due timestamp has passed", () => {
    const progress = { interval: 1, ease: 2.5, due: 1000, reps: 1 };
    expect(isDue(progress, 2000)).toBe(true);
  });

  it("is not due before the due timestamp", () => {
    const progress = { interval: 1, ease: 2.5, due: 2000, reps: 1 };
    expect(isDue(progress, 1000)).toBe(false);
  });
});

describe("schedule", () => {
  it("resets reps and interval to 0 on again", () => {
    const progress = { interval: 10, ease: 2.5, due: 0, reps: 3 };
    const result = schedule(progress, "again");
    expect(result.interval).toBe(0);
    expect(result.reps).toBe(0);
    expect(result.ease).toBeLessThan(progress.ease);
  });

  it("never drops ease below the floor", () => {
    const progress = { interval: 1, ease: 1.3, due: 0, reps: 2 };
    const result = schedule(progress, "hard");
    expect(result.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("schedules a new card's first good review one day out", () => {
    const result = schedule(undefined, "good");
    expect(result.interval).toBe(1);
    expect(result.reps).toBe(1);
  });

  it("schedules a new card's first easy review three days out", () => {
    const result = schedule(undefined, "easy");
    expect(result.interval).toBe(3);
  });

  it("grows the interval on repeated good reviews", () => {
    const first = schedule(undefined, "good");
    const second = schedule(first, "good");
    const third = schedule(second, "good");
    expect(second.interval).toBeGreaterThan(first.interval);
    expect(third.interval).toBeGreaterThan(second.interval);
  });
});
