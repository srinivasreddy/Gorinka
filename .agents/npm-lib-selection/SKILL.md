---
name: npm-lib-selection
description: >
  Prefer established, widely-used npm packages for common non-UI utility
  needs (dates, validation, pattern matching, class-name joining, unique
  IDs) instead of hand-rolling them. Use when writing TypeScript/JS logic
  that touches date math, input validation/parsing, conditional class
  names, or ID generation. Does NOT cover UI component libraries — those
  stay governed by this project's existing Tailwind/Radix/shadcn
  confirm-first policy in AGENTS.md.
license: MIT
metadata:
  version: "1.0.0"
  scope: non-UI utilities only
  companion-policy: See AGENTS.md's "When the mandated stack doesn't fit" — that
    confirm-first gate is for UI libraries and is intentionally untouched by
    this skill.
  sources:
    - npm download rankings (npmjs.com / npm-stat)
    - this project's own package.json (frontend already depends on date-fns,
      zod, clsx — this skill documents *why* and extends the same principle
      to a few gaps)
---

# npm Library Selection (non-UI utilities)

Companion to `typescript-pro` (type-system design) and the design-system
policy in `AGENTS.md` (UI component libraries). This skill covers a
narrower, different thing: **logic-level utility code** — date math,
input validation, exhaustive branching, conditional class strings, unique
IDs — where a well-established npm package is almost always a better
default than hand-rolled code, the same way `rust-skills`'s `lib-*`
category treats crates.io for Rust.

**This is not a "go add dependencies" license.** It's the opposite of a
free-for-all: for the specific problems below, an established package is
the *conservative* choice, because the hand-rolled alternative is where
subtle date/locale/validation bugs actually come from. Scope stays
deliberately narrow — UI libraries are a different decision with a
different (confirm-first) process; don't conflate the two.

## When to Apply

- Writing date/time arithmetic, formatting, or comparisons
- Validating or parsing untrusted input (form data, API responses, `.env`)
- Branching exhaustively over a union/discriminated-union of cases
- Building a conditional `className` string
- Generating a unique ID/key

## Rules

- [`npm-date-fns-datetime`](rules/npm-date-fns-datetime.md) - Use `date-fns` for date math, not manual calendar arithmetic
- [`npm-zod-validation`](rules/npm-zod-validation.md) - Use `zod` to validate/parse untrusted input, not hand-written checks
- [`npm-ts-pattern-matching`](rules/npm-ts-pattern-matching.md) - Use `ts-pattern` for exhaustive matching over nested `if`/`switch`
- [`npm-clsx-classnames`](rules/npm-clsx-classnames.md) - Use `clsx`/`tailwind-merge` for conditional class strings
- [`npm-nanoid-identifiers`](rules/npm-nanoid-identifiers.md) - Use `nanoid` (or `crypto.randomUUID()`) for unique IDs

## Already-Established Defaults in This Project

Check `package.json` before adding a new dependency for something already covered:

| Need | Already a dependency here |
|------|---------------------------|
| Date math/formatting | `date-fns` |
| Schema validation/parsing | `zod` (+ `@hookform/resolvers` for react-hook-form integration) |
| Conditional class names | `clsx` + `tailwind-merge` |
| Form state | `react-hook-form` |
| HTTP requests | `axios` via `lib/api.ts` (see the HTTP client convention, not a new client) |

## What This Skill Does Not Cover

- **UI component/interaction libraries** (dialogs, data grids, charting, date pickers) — governed by `AGENTS.md`'s confirm-first policy, not this skill. Don't use "there's an established package for this" as a bypass for that gate.
- **Type-system design** (branded types, generics, discriminated unions) — see `typescript-pro`.
- **Framework conventions** (data fetching, server components) — see `nextjs-developer`.

## See Also

- `AGENTS.md` — "When the mandated stack doesn't fit" (the UI-library confirm-first policy this skill deliberately does not extend to)
- `typescript-pro/SKILL.md`
- The Rust equivalent of this idea: `client/.agents/rust-skills/rules/lib-prefer-crates-overview.md`
