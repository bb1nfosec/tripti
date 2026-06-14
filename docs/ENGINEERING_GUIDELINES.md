# Engineering Guidelines

For software contributors. Read [ARCHITECTURE.md](../ARCHITECTURE.md) and
[docs/SECURITY_AUDIT.md](SECURITY_AUDIT.md) alongside this. These standards keep
Tripti small, safe, and consistent.

## 1. Principles (non-negotiable)

1. **Local-first.** All user data lives in the browser (IndexedDB via Dexie). The
   only server code is the stateless `/api/llm` proxy. Don't add a backend or a
   datastore.
2. **One LLM call per action.** No agents, orchestration loops, chains, or a second
   model. If something seems to need more, open an issue first.
3. **Typed boundaries.** Every external input — HTTP body, LLM response, stored
   record — is validated with **zod** before use.
4. **Fail safe and quiet.** On any uncertainty (parse failure, blocked provider,
   missing capability, offline) degrade to the safe local path. Never to an insecure
   fallback, never a stack trace in the UI.
5. **Security is a feature, not a chore.** The API key lives in the page — code like
   it.

## 2. Architecture rules

- Respect the layering (UI → orchestration → data/providers → pure helpers). **Lower
  layers never import upper ones.**
- New screen → `src/screens/`; new reusable UI → `src/components/ui.tsx`; data access
  → `src/data/repo.ts` only (components don't touch Dexie tables directly).
- Routing/flow lives in the `App.tsx` state machine; screens stay presentational +
  local interactions.
- The root page is `force-dynamic` on purpose (CSP nonce). Don't make it static.
- Dexie access is browser-only — guard against SSR (`db()` throws on the server);
  client-only entry is via `next/dynamic` `ssr:false`.

## 3. TypeScript & React

- **Strict TypeScript.** No `any` — prefer `unknown` + a zod parse, or precise types.
- Type all public function signatures and all data crossing a boundary.
- Use the design tokens (`src/lib/tokens.ts`) for styling; inline style objects are
  the house style (matches the design). Don't introduce a CSS framework.
- Prefer pure functions and small components. Avoid premature abstraction.
- Keep dependencies minimal; discuss any new runtime dependency in the PR. **No new
  CDN/`<script>` deps — ever** (CSP).

## 4. Data & state

- All reads/writes go through `repo.ts`; sanitize free text on the way in.
- Use `useLiveQuery` (dexie-react-hooks) for reactive reads.
- Schema changes require a **new Dexie `version()`** with a migration — never mutate
  an existing version's stores.

## 5. Providers (BYOLLM)

- Implement the `LLMProvider` interface (`generate()` only).
- Browser-direct only if the provider allows CORS; otherwise route through
  `providers/proxy.ts` + the `/api/llm` route, and allowlist the endpoint in both the
  route and the CSP `connect-src`.
- **Never log or persist a key.** Map provider errors to calm, secret-free messages.
- See ARCHITECTURE.md § "Adding a provider" for the exact checklist.

## 6. Security must-dos (PR will be rejected otherwise)

- Validate + length-cap untrusted input with zod at the boundary.
- Sanitize free text **twice**: `sanitizeForPrompt` (injection) before prompts,
  `cleanText` (XSS) before render.
- **Never** use `dangerouslySetInnerHTML` or `eval`/`new Function`.
- Parse every LLM response through its zod schema; on failure, fall back — never
  trust output as code.
- Don't log/persist keys, prompts, or household data. No telemetry. No secrets in
  source, query strings, or error messages.
- Keep the CSP strict; don't add origins to `connect-src` beyond a provider endpoint.

## 7. Performance

- Target low-end Android. Animate `transform`/`opacity` only; respect
  `prefers-reduced-motion`.
- Lazy-load heavy/optional code (provider SDKs already land in split chunks).
- Keep the first load lean; avoid large dependencies.

## 8. Quality gates (must pass locally and in CI)

```bash
npm run typecheck   # tsc --noEmit, strict — zero errors
npm run lint        # next lint — zero errors
npm run build       # production build succeeds
```

CI additionally runs **CodeQL** (SAST), **gitleaks** (secrets), **npm audit**
(gates on production-critical), and **dependency review** on PRs. Don't merge red.

## 9. Commits, branches & PRs

- Branch from `main`: `feat/…`, `fix/…`, `docs/…`, `refactor/…`, `chore/…`.
- **Conventional Commits** for messages (`feat:`, `fix:`, `docs:`, …). Keep commits
  focused and the history clean (the repo uses a **linear history** — rebase, don't
  merge-commit, when updating a branch).
- Open a PR against `main`, fill in the [template](../.github/PULL_REQUEST_TEMPLATE.md),
  and link the issue. All changes land via PR with green checks.
- Never commit a real API key. Use the app UI for keys; operator keys go in env
  (`.env.example`).

## 10. Definition of Done

- [ ] Meets the principles in §1 and the security must-dos in §6
- [ ] `typecheck`, `lint`, `build` pass; CI green
- [ ] New free text validated (zod) and sanitized (both passes)
- [ ] No new third-party scripts/CDNs; CSP unchanged or justified
- [ ] Motion respects `prefers-reduced-motion`; touch targets ≥ 44px
- [ ] User-facing copy added to i18n (EN + Hinglish + हिंदी where feasible)
- [ ] Docs updated (README/ARCHITECTURE) if behavior or structure changed
