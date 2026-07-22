# npm-clsx-classnames

> Use `clsx` (+ `tailwind-merge` when Tailwind classes can conflict) for conditional class strings

## Why It Matters

Both are already dependencies here. Manual template-literal class-string building (`` `btn ${active ? "active" : ""} ${size === "lg" ? "btn-lg" : ""}` ``) accumulates stray whitespace, is easy to get wrong with multiple conditions, and — critically for Tailwind — doesn't resolve conflicting utility classes (e.g. two different `px-*` values both ending up in the string, with the browser silently picking whichever comes last in the generated CSS, not whichever came last in your string).

## Bad

```typescript
// Stray double-spaces when a condition is false; no way to tell which
// px-* class "wins" if both a default and an override are present.
const className = `btn ${active ? "btn-active" : ""} ${props.className || ""}`;
```

## Good

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const className = twMerge(clsx("btn", active && "btn-active"), props.className);
// twMerge resolves conflicting Tailwind utilities deterministically —
// the later class in the merge wins, not whichever the browser cascade picks
```

## See Also

- [npm-lib-selection overview](../SKILL.md)
- `AGENTS.md`'s design-system section — this is the class-name mechanism it already assumes
