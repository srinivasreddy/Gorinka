# npm-date-fns-datetime

> Use `date-fns` for date math and formatting, not manual calendar arithmetic

## Why It Matters

`date-fns` is already a dependency of this project (`frontend/package.json`). Hand-rolled date math (adding days, comparing ranges, formatting) reliably gets leap years, month-length, timezone, and DST edge cases wrong — the kind of bug that only shows up on specific dates in production, not in a quick manual test.

## Bad

```typescript
// Wrong once the day-of-month arithmetic crosses a month boundary with a
// different length, and ignores leap years entirely.
function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days); // JS Date handles this correctly by
  return next;                          // luck, but formatting/comparisons
}                                        // downstream are the real risk

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString(); // locale-dependent string compare
}
```

## Good

```typescript
import { addDays, isSameDay, format } from "date-fns";

const next = addDays(date, 7);
const same = isSameDay(a, b);
const label = format(date, "yyyy-MM-dd");
```

## See Also

- [npm-lib-selection overview](../SKILL.md)
