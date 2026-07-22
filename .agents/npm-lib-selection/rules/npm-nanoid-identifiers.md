# npm-nanoid-identifiers

> Use `nanoid` or `crypto.randomUUID()` for unique IDs, not `Math.random()`-based strings

## Why It Matters

`Math.random()` is not a cryptographically secure source and has measurable collision risk at scale — fine for a Monte Carlo simulation, not for anything that needs to actually be unique (React keys generated at runtime, idempotency keys, temporary client-side IDs before a server assigns a real one). `crypto.randomUUID()` is built into modern browsers/Node with no dependency needed; reach for `nanoid` specifically when you want shorter IDs or a custom alphabet.

## Bad

```typescript
// Collision-prone, not cryptographically sound, and produces
// variable-length strings depending on the random value.
function tempId(): string {
  return Math.random().toString(36).slice(2);
}
```

## Good

```typescript
// No dependency needed — built into the platform.
const id = crypto.randomUUID();

// Or, when a shorter ID or custom alphabet is specifically wanted:
import { nanoid } from "nanoid";
const shortId = nanoid(10);
```

## See Also

- [npm-lib-selection overview](../SKILL.md)
