---
name: http-client
description: "Use whenever this frontend calls the Pichuka Django API (server actions, lib/api.ts, route handlers). Invoke when adding or editing HTTP calls, server actions that POST/GET the backend, or token-authenticated requests. Triggers on: fetch, axios, API_URL, TRACKER_API_URL, apiFetch, server action, lib/api."
license: MIT
metadata:
  domain: frontend
  triggers: fetch, axios, TRACKER_API_URL, apiFetch, server action, HTTP client
  role: specialist
  scope: implementation
  output-format: code
  related-skills: nextjs-developer, typescript-pro
---

# HTTP Client

This project calls the Pichuka Django API (`TRACKER_API_URL`) via **axios**, not the native
`fetch` API. Use a shared axios instance rather than ad-hoc `fetch()` calls.

## Core Workflow

1. **Add axios as a dependency** if it isn't already in `package.json`
   (`npm install axios`).
2. **Use a shared client** — `lib/api.ts` should export a configured `axios` instance
   (base URL = `TRACKER_API_URL`, JSON headers) rather than each caller building its own
   request.
3. **Attach the session token per-request** via the instance's request config (or an
   interceptor) using `getSession()` from `lib/session.ts` — don't hardcode
   `Authorization` headers inline at call sites.
4. **Handle errors via axios' error shape** (`AxiosError`, `error.response?.status`,
   `error.response?.data`) instead of checking `res.ok` / `res.status`.

## Conventions (adapted from existing `lib/api.ts` / server actions)

- Central instance, e.g.:

```ts
// lib/api.ts
import axios from "axios"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"

export const api = axios.create({
  baseURL: process.env.TRACKER_API_URL,
  headers: { "Content-Type": "application/json" },
})

export async function apiRequest<T>(
  config: Parameters<typeof api.request>[0]
): Promise<T> {
  const token = await getSession()
  if (!token) redirect("/login")

  try {
    const res = await api.request<T>({
      ...config,
      headers: { ...config.headers, Authorization: `Token ${token}` },
    })
    return res.data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      redirect("/login")
    }
    throw err
  }
}
```

- **GET helpers**: `getScore()`/`getSummary()`-style functions wrap `apiRequest` with a
  `{ url, method: "GET" }` config — same call-site shape as today, just swapping the
  `fetch` body for `apiRequest`.
- **Server actions** (`app/actions/*.ts`) that currently call `fetch(...)` directly
  (e.g. `login`, `register`, `authorizeDevice`) should go through `api`/`apiRequest` too,
  using `axios.isAxiosError(err)` + `err.response?.data` in place of
  `res.json().catch(() => null)` for error bodies.
- **Device/registration flows that run unauthenticated** (no session token yet, e.g.
  `register`, `login`) call `api.post(...)` directly without `apiRequest`'s token
  injection.

## Notes

- Native `fetch`'s Next.js extensions (`cache`, `next.revalidate`, `next.tags`) don't
  apply to axios. This project's API calls are all per-request/auth-bound
  (`cache: "no-store"` today), so this is not a loss in practice — if a future endpoint
  genuinely benefits from Next's data cache, that's the one case to fall back to `fetch`
  for, and should be called out explicitly in the PR.

## MUST NOT DO

- Don't call `fetch()` directly against `TRACKER_API_URL` in new code — use `api` /
  `apiRequest` from `lib/api.ts`.
- Don't duplicate base-URL / header / token-attachment logic at each call site.
- Don't introduce other HTTP libraries (`ky`, `got`, `superagent`, etc.) — axios only.
