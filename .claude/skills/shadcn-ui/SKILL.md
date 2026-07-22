---
name: shadcn-ui
description: "Use when building or styling any UI in this Next.js frontend. Invoke to add new components, style pages, or work with the design system. Triggers on: Tailwind, shadcn, shadcn/ui, Radix, Base UI, components/ui, design system, theme tokens, dark mode, oklch, cva, class-variance-authority, cn()."
license: MIT
metadata:
  domain: frontend
  triggers: Tailwind, shadcn, Radix, Base UI, components/ui, design tokens, dark mode, cva
  role: specialist
  scope: implementation
  output-format: code
  related-skills: nextjs-developer, typescript-pro
---

# shadcn/ui Design System

This project's UI is built **exclusively** with Tailwind CSS v4, Base UI / Radix primitives, and
shadcn-style components. See `frontend/AGENTS.md` for the hard constraint — do not introduce other
component libraries (MUI, Chakra, Bootstrap, Mantine, etc.) or ad-hoc CSS files.

## Core Workflow

1. **Check `components/ui/` first** — `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `chart.tsx`
   already exist. Reuse them before writing new markup.
2. **Need a component that doesn't exist?** Add it via the shadcn CLI (`npx shadcn@latest add <name>`)
   or hand-write it following the existing pattern (below) — keep it in `components/ui/`.
3. **Style with Tailwind utilities** referencing the theme tokens in `app/globals.css` — never
   hardcode colors/spacing that have a token equivalent.
4. **Compose**, don't duplicate — build feature components (`components/dashboard/*`) out of
   `components/ui/*` primitives.

## Conventions (derived from existing code)

- **Primitives come from `@base-ui/react/*`** (Base UI — the Radix team's successor to Radix UI),
  not raw HTML elements. e.g. `import { Button as ButtonPrimitive } from "@base-ui/react/button"`.
- **`data-slot="<name>"`** attribute on the root element of every primitive, for targeting via CSS
  or composition (e.g. `data-slot="button"`, `data-slot="input"`).
- **Variants via `cva`** (`class-variance-authority`) — see `components/ui/button.tsx` for the
  `variant`/`size` pattern. Export both the component and its `*Variants` function.
- **Always merge classNames with `cn()`** from `lib/utils.ts` (`clsx` + `tailwind-merge`) — never
  string-concatenate `className`.
- **Theme tokens, not raw values** — use `bg-background`, `text-foreground`, `border-border`,
  `text-muted-foreground`, `text-destructive`, `bg-primary`, etc. These map to CSS variables defined
  in `:root` / `.dark` in `app/globals.css` (oklch colors) via the `@theme inline` block.
- **Dark mode** is handled by the `.dark` class + `@custom-variant dark (&:is(.dark *))` — components
  should rely on tokens (which flip automatically) rather than `dark:` variants where possible.
- **Radius scale** — use `rounded-lg`/`rounded-xl` etc., which derive from `--radius` via
  `--radius-sm`/`--radius-md`/... in `@theme inline`. Don't hardcode `rounded-[Npx]`.

## Tailwind v4 specifics

- No `tailwind.config.js` — config lives in `app/globals.css` via `@import "tailwindcss"`,
  `@theme inline { ... }`, and plain CSS custom properties.
- `@layer base` applies global resets (`border-border`, `bg-background text-foreground`, `font-sans`
  on `html`). `--font-sans` must map to the variable Next's `next/font` actually sets on `<html>`
  (currently `--font-geist-sans` from `app/layout.tsx`) — don't reintroduce a circular
  `--font-sans: var(--font-sans)`.
- Don't add `@import` statements for packages that don't ship CSS (e.g. the `shadcn` npm package is
  the CLI only, not a stylesheet).

## Example: new form component

```tsx
// components/ui/textarea.tsx
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background flex min-h-16 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

## MUST NOT DO

- Don't add MUI, Chakra, Bootstrap, Ant Design, or other styled component libraries.
- Don't write standalone `.css`/`.module.css` files for component styling — use Tailwind utilities.
- Don't bypass `components/ui/*` primitives for things they already cover (buttons, inputs, cards).
- Don't hardcode colors (`#fff`, `rgb(...)`) where a theme token exists.
