# npm-ts-pattern-matching

> Use `ts-pattern` for exhaustive matching over a union, instead of nested `if`/`switch`

## Why It Matters

TypeScript's `switch` gives you exhaustiveness checking only if you remember the `never`-typed default-case trick every time — easy to skip under deadline pressure, and nothing stops a new union variant from silently falling through an `if`/`else if` chain with no `else`. `ts-pattern` makes exhaustiveness a compile error by construction via `.exhaustive()`, and reads more directly as "match this shape" than a chain of type guards.

## Bad

```typescript
type RequestState =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; error: Error };

// Adding a new RequestState variant compiles silently here — nothing forces
// this function to handle it.
function render(state: RequestState): string {
  if (state.status === "loading") return "Loading…";
  if (state.status === "success") return state.data.join(", ");
  return state.error.message;
}
```

## Good

```typescript
import { match } from "ts-pattern";

function render(state: RequestState): string {
  return match(state)
    .with({ status: "loading" }, () => "Loading…")
    .with({ status: "success" }, (s) => s.data.join(", "))
    .with({ status: "error" }, (s) => s.error.message)
    .exhaustive(); // compile error if a variant is ever added and unhandled
}
```

## See Also

- [npm-lib-selection overview](../SKILL.md)
- `typescript-pro/references/type-guards.md` — the `never`-based exhaustiveness pattern this replaces
