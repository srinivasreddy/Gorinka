# npm-zod-validation

> Use `zod` to validate/parse untrusted input, not hand-written checks

## Why It Matters

`zod` is already a dependency here and pairs with `@hookform/resolvers` for form validation. Hand-written validation (`typeof x === "string" && x.length > 0`) scales badly past 2-3 fields, doesn't compose, and gives you a loosely-typed result instead of a parsed, trusted value — exactly the "parse, don't validate" gap zod closes with a single schema that both validates and produces the typed output.

## Bad

```typescript
// Scattered checks, no single source of truth for the shape, and the
// caller still has an untyped `unknown`/`any` after "validating."
function isValidUser(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.email === "string" && d.email.includes("@") &&
         typeof d.name === "string" && d.name.length > 0;
}
```

## Good

```typescript
import { z } from "zod";

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});
type User = z.infer<typeof UserSchema>;

function parseUser(data: unknown): User {
  return UserSchema.parse(data); // throws ZodError with field-level detail on failure
}
```

## See Also

- [npm-lib-selection overview](../SKILL.md)
