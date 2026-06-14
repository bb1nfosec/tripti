# Architecture

Tripti is a **local-first, browser-only PWA**. There is no application database and
no backend of our own — the only server code is a thin, stateless proxy for AI
providers that browsers can't call directly. Everything else runs on the user's
device.

## Layers

The code is organized by responsibility, with dependencies pointing inward
(UI → orchestration → data/providers → pure helpers). Lower layers never import
upper ones.

```
┌─────────────────────────────────────────────────────────────┐
│ app/            Next.js App Router                            │
│   layout.tsx    fonts (self-hosted), PWA metadata, SW reg     │
│   page.tsx      force-dynamic entry → <AppClient/> (ssr:false) │
│   api/llm/      stateless proxy: OpenAI/Groq + operator key    │
│ middleware.ts   strict CSP w/ per-request nonce               │
├─────────────────────────────────────────────────────────────┤
│ components/     UI primitives (ui.tsx, Logo, HeroCard) +       │
│ screens/        the App.tsx state machine and one file/screen  │
├─────────────────────────────────────────────────────────────┤
│ prompt/  llm/   builder → provider → zod parse (one call)      │
├─────────────────────────────────────────────────────────────┤
│ data/           Dexie schema, repository, provisioning catalog │
│ providers/      BYOLLM abstraction + capability check          │
├─────────────────────────────────────────────────────────────┤
│ lib/            tokens, i18n, sanitize, hooks (pure, no deps)  │
└─────────────────────────────────────────────────────────────┘
```

### `app/` — framework edge
- **`page.tsx` is `force-dynamic`.** This is load-bearing: the strict CSP nonce is
  generated per request in `middleware.ts`, and Next only injects it into its
  inline hydration scripts when the route renders per request. A static route would
  ship nonce-less inline scripts that the CSP blocks → blank screen.
- **`api/llm/route.ts`** is the *only* server logic: a proxy for providers that
  block browser CORS (OpenAI, Groq) plus the operator "shared access" path. It is
  zod-validated, same-origin-only, rate-limited, logs nothing, and reads the
  operator key only from server env.

### `components/` + `screens/`
- `components/App.tsx` is the **state machine / router**: it decides which screen to
  show (entry → provider → onboarding → daily → hero → …) and owns the suggestion
  flow. Screens are presentational + their own local interactions.
- `components/ui.tsx` holds shared primitives (Screen, Chip, Segmented, buttons,
  language toggle) styled from the design tokens.

### `prompt/` + `llm/` — the one-call pipeline
Each AI action is **exactly one provider call**, never a chain:

```
daily input ─▶ prompt/builder.ts ─▶ providers (chosen) ─▶ llm/parse.ts (zod) ─▶ hero card
                (sanitized)            (one request)        (validated/cleaned)
```

- `llm/schema.ts` — the zod source of truth (`SuggestionSchema`, `HealthReviewSchema`).
- `llm/parse.ts` / `llm/health.ts` — extract + validate JSON; on failure throw a
  typed `ParseError` so the UI shows a calm, real fallback (never a stack trace).

### `data/` — local persistence
- `data/db.ts` — Dexie (IndexedDB) schema. Versioned migrations (`version(1)`,
  `version(2)`).
- `data/repo.ts` — all reads/writes go through repository functions (sanitizing
  free text on the way in). UI uses `useLiveQuery` for reactivity.
- `data/provisioning.ts` — the grocery catalog (rates/sources) lives in code; only
  the household's quantities live in Dexie.

### `providers/` — bring your own LLM
A single `LLMProvider` interface with one method, `generate()`. Implementations:
Anthropic (browser-direct), Gemini (native SDK), OpenAI + Groq (via the proxy),
operator "shared" (via the proxy, server key), and experimental on-device
(Chrome Prompt API / local OpenAI-compatible server). `makeProvider(config)` builds
the live provider from the stored config; `capability.ts` probes the device.

### `lib/` — pure helpers
Design tokens, the i18n dictionaries (`i18n.ts`, `provI18n.ts`), `sanitize.ts`
(prompt-injection + XSS), and small hooks (`useOnline`). No imports from upper
layers.

## Key decisions

| Decision | Why |
|---|---|
| Local-first, no backend | Privacy: a household's health + budget are personal. |
| BYOLLM via a tiny interface | Users keep control of (and pay for) their own AI. |
| One LLM call per action | Predictable cost/latency; no agent loops to audit. |
| zod at every boundary | Untrusted model output can't reach render or storage unchecked. |
| Strict nonce CSP, self-hosted fonts | Defense in depth — the API key lives in the page. |
| Dexie over raw IndexedDB | Typed tables, migrations, reactive queries. |

## Adding a provider

1. Implement `LLMProvider` in `src/providers/yourprovider.ts` (browser-direct, or
   route through `proxy.ts` if CORS-blocked).
2. Add it to `ProviderType` in `data/db.ts`, `DEFAULT_MODELS` in `providers/types.ts`,
   and the `makeProvider` / `validateKey` switches in `providers/index.ts`.
3. Surface it in `screens/ProviderScreen.tsx`.
4. If it needs the proxy, allowlist its endpoint in `app/api/llm/route.ts` and the
   CSP `connect-src` in `middleware.ts`.
