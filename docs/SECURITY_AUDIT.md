# Tripti — Security Self-Assessment

| | |
|---|---|
| **Project** | Tripti (local-first, BYOLLM food companion PWA) |
| **Assessment type** | Internal security self-assessment + automated testing |
| **Date** | 2026-06-15 |
| **Version** | `main` (latest) |
| **Classification** | Public |

> **Honesty note.** This is a maintainer self-assessment supported by automated
> tooling — **not** an independent third-party penetration test or certification.
> It documents the controls in place, how they were verified, and the residual
> risks we know about. Independent review is welcome; see
> [SECURITY.md](../SECURITY.md) to report findings.

---

## 1. Summary

Tripti is a browser-only, local-first application. It has **no application backend
and no database of its own** — the only server-side code is a thin, stateless proxy
for AI providers that browsers cannot call directly. The design minimizes attack
surface by keeping all user data on the device and making exactly one outbound LLM
call per user action.

The dominant risk is that, by design, the user's AI provider key lives in the
browser page. The controls below are organized around protecting that key and the
household's data, and around treating all model output and free text as untrusted.

**Overall posture: strong for the design class (local-first BYOLLM).** No critical
or high findings in first-party application code at the time of assessment. Residual
risks are inherent to the BYOLLM model and to broad upstream-framework advisories
(tracked, see §10).

## 2. Scope & methodology

**In scope:** all first-party source in `src/`, the `/api/llm` proxy, the CSP
middleware, build/CI configuration, and dependency posture.

**Methods used:**

| Method | Tool / approach | Where |
|---|---|---|
| Manual secure code review | Maintainer review against OWASP Secure Coding Practices | this document |
| Static analysis (SAST) | **CodeQL** (`security-and-quality`) | `.github/workflows/codeql.yml` |
| Secret scanning | **gitleaks** (CI + optional pre-commit) | `.github/workflows/ci.yml`, `.pre-commit-config.yaml` |
| Dependency vulnerability scan | **npm audit** (gate on prod-critical) + **Dependabot** (auto-PRs) | `.github/workflows/ci.yml`, `.github/dependabot.yml` |
| Type safety | `tsc --noEmit` (strict) | `.github/workflows/ci.yml` |
| Lint | `next lint` (`next/core-web-vitals`) | `.github/workflows/ci.yml` |

**Out of scope / not performed:** third-party penetration test; DAST against a live
deployment; review of third-party AI providers or a user's self-hosted/on-device
model server; security of a device the user does not control.

## 3. Threat model

**Assets**
- A1 — The user's AI provider **API key** (in IndexedDB / in the page at runtime).
- A2 — **Household data**: members, health notes, dislikes, plan, budget, history.
- A3 — The optional **operator key** (server environment, shared-access path).

**Trust boundaries**
- Browser ↔ AI provider (Anthropic/Gemini browser-direct; OpenAI/Groq via proxy).
- Browser ↔ `/api/llm` proxy (same-origin).
- Proxy ↔ provider (server-to-server; carries the user's key for one request, or
  the operator key for the shared path).

**Primary threats (STRIDE-flavored)**
- **Tampering / Injection** — malicious free text attempting prompt injection;
  malformed/hostile LLM output reaching render or storage.
- **Information disclosure** — leaking A1/A2/A3 via logs, analytics, error messages,
  query strings, or third-party scripts.
- **XSS** — script injection executing in a page that holds the key.
- **DoS / abuse** — abuse of the proxy / operator key.
- **Supply chain** — a compromised or vulnerable dependency.

## 4. Controls & verification

| # | Control | Implementation | Verified |
|---|---|---|---|
| C1 | **Strict CSP**, per-request script nonce, no third-party scripts | `src/middleware.ts` | Header inspected on live deploy; inline scripts carry nonce |
| C2 | Security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, minimal `Permissions-Policy`) | `next.config.mjs` | Present (4/4) |
| C3 | `connect-src` allowlist (only chosen provider endpoints + self) | `src/middleware.ts` | Reviewed |
| C4 | Self-hosted fonts (no CDN) | `@fontsource`, `src/app/layout.tsx` | No external font links in output |
| C5 | **Input validation at the boundary** (zod, length-capped) | `src/app/api/llm/route.ts`, `src/llm/schema.ts` | Reviewed |
| C6 | **Prompt-injection sanitization** of free text | `sanitizeForPrompt` in `src/lib/sanitize.ts` | Used across data/prompt/llm |
| C7 | **XSS sanitization on output**; no `dangerouslySetInnerHTML`; no `eval` | `cleanText`, React escaping | grep: 0 occurrences of either |
| C8 | **Typed LLM output**; reject/repair, never trust as code | `src/llm/parse.ts`, `src/llm/health.ts` | Reviewed; throws typed `ParseError` → safe fallback |
| C9 | Key stored only in IndexedDB; never logged/analytics/query-string | `src/data/db.ts`, providers | grep: no `console.*` logging of secrets |
| C10 | Errors stripped of secrets; domestic messages, no stack traces | provider `*Error` mappers; proxy | Reviewed |
| C11 | **Operator key server-only**; client sees only a boolean | `src/app/api/llm/route.ts` (`GET` → `{sharedAccess}`) | Reviewed; verified `403`/`400` guards live |
| C12 | Proxy: same-origin check, per-IP rate limit, target allowlist, logs nothing | `src/app/api/llm/route.ts` | Reviewed; live `403`/`400`/`429` behavior confirmed |
| C13 | **No telemetry** by default | (absent by design) | grep: no analytics SDKs |
| C14 | Service worker never caches `/api/*` or cross-origin | `public/sw.js` | Reviewed |
| C15 | Pinned deps + committed lockfile; SAST + secret + dep scans in CI | `package-lock.json`, workflows | CI green |
| C16 | Fail-safe degradation (parse fail / blocked provider / offline → local path) | App state machine + fallbacks | Reviewed |

## 5. OWASP Top 10 (2021) mapping

| Risk | Relevance & handling |
|---|---|
| A01 Broken Access Control | No multi-user backend; operator key gated server-side (C11); proxy same-origin only (C12). |
| A02 Cryptographic Failures | No custom crypto; HTTPS enforced (`upgrade-insecure-requests`); secrets not persisted server-side. |
| A03 Injection | Prompt-injection (C6) + XSS (C7) + zod validation (C5/C8); no SQL (IndexedDB via Dexie, parameterized). |
| A04 Insecure Design | Local-first, minimal surface, one-call pipeline, fail-safe (C16); documented threat model. |
| A05 Security Misconfiguration | Strict CSP + headers (C1/C2); no debug endpoints; env-only operator secret. |
| A06 Vulnerable Components | npm audit + Dependabot + pinned lockfile (C15); see §10. |
| A07 Auth Failures | No accounts/passwords; nothing to brute-force. |
| A08 Software & Data Integrity | Lockfile, CI provenance, no remote `<script>`/CDN (C4/C15); SW integrity (C14). |
| A09 Logging & Monitoring Failures | Deliberately no PII/secret logging (C9/C13); proxy logs nothing (privacy-by-design trade-off, documented). |
| A10 SSRF | Proxy targets are a fixed allowlist; user-supplied on-device URL is restricted to localhost by CSP `connect-src`. |

## 6. OWASP ASVS alignment (selected)

Targeting **ASVS L1**, with several L2 controls, appropriate for a client-side app
with no server-side user data store.

- **V1 Architecture** — documented design, threat model, trust boundaries (this doc, ARCHITECTURE.md).
- **V5 Validation/Sanitization/Encoding** — zod at boundaries; output encoded via React; no `innerHTML`/`eval`. ✔
- **V7 Error Handling & Logging** — generic errors, secrets stripped, no sensitive logging. ✔
- **V8 Data Protection** — minimal data, on-device only, no third-party exfiltration paths. ✔
- **V12 Files/Resources** — no file upload; SW caching scoped. ✔
- **V13 API/Web Service** — proxy validates input, rate-limits, same-origin. ✔
- **V14 Configuration** — CSP, security headers, dependency management, no secrets in source. ✔

## 7. OWASP Secure Coding Practices checklist (condensed)

- Input validation: centralized, zod, length-capped, allowlists. ✔
- Output encoding: contextual via React; sanitize model/free text. ✔
- Authentication/session: N/A (no accounts). —
- Access control: operator secret server-side; proxy same-origin. ✔
- Cryptographic practices: rely on platform TLS; no homegrown crypto. ✔
- Error handling & logging: fail safe; no secret leakage. ✔
- Data protection: data minimization; local-only; no telemetry. ✔
- Communication security: HTTPS upgrade; pinned connect-src. ✔
- System configuration: strict headers/CSP; least privilege CI tokens. ✔
- Memory management: managed runtime (TS/JS). —

## 8. NIST SSDF (SP 800-218) mapping

| Practice group | Practice | How Tripti addresses it |
|---|---|---|
| **PO** Prepare the Organization | PO.3 Supporting toolchains | CI runs SAST (CodeQL), secret scan (gitleaks), dep scan (npm audit/Dependabot), type/lint. |
| | PO.5 Secure environments | Least-privilege workflow `permissions`; secrets via env, never in repo. |
| **PS** Protect the Software | PS.1 Protect code from unauthorized access | GitHub branch `main`, PR flow, code review (CONTRIBUTING.md). |
| | PS.2 Provide provenance | Committed lockfile; CI build from pinned deps; signed-off commits. |
| | PS.3 Archive & protect releases | Versioned Git history; releases tracked on `main`. |
| **PW** Produce Well-Secured Software | PW.1 Design meeting security requirements | Documented threat model + ARCHITECTURE.md; security requirements in CONTRIBUTING. |
| | PW.4 Reuse secure components | Minimal, pinned, audited dependencies; no CDN scripts. |
| | PW.5 Secure coding practices | OWASP secure-coding alignment (§7); zod boundaries; sanitization. |
| | PW.7 Review/analyze human-readable code | Manual review + CodeQL on every PR. |
| | PW.8 Test executable code | `tsc`, lint, build, dependency review in CI. |
| | PW.9 Secure-by-default settings | Strict CSP/headers; on-device & shared-access never default; honest privacy copy. |
| **RV** Respond to Vulnerabilities | RV.1 Identify vulnerabilities | Dependabot + npm audit + CodeQL + private advisory intake (SECURITY.md). |
| | RV.2 Assess, prioritize, remediate | Documented audit policy; criticals gate CI; majors applied deliberately. |
| | RV.3 Analyze root cause | Findings tracked in advisories/issues; this report updated per release. |

## 9. Findings & residual risks

| ID | Severity | Status | Description / mitigation |
|---|---|---|---|
| F1 | Info / by-design | Accepted | **API key lives in the browser.** Inherent to BYOLLM. Mitigations: stored only in IndexedDB, never logged, honest "only as safe as your phone" copy. On-device option sends nothing at all. |
| F2 | Low | Mitigated | **Proxy rate-limit is per-instance** (serverless), not global. Best-effort; operators serving the shared key at scale should add platform-level WAF/rate-limiting. |
| F3 | Low | Accepted | **CSP allows `style-src 'unsafe-inline'`** for inline style attributes (scripts remain strict/nonce-only). Lower risk; revisit if styles move to classes. |
| F4 | Low | Accepted | **User-supplied on-device URL** (custom OpenAI-compatible server) is trusted by the user; restricted to localhost by `connect-src`. WebLLM is intentionally not bundled (would need CDN weights → CSP). |
| F5 | Medium (upstream) | Tracked | **`npm audit` flags broad Next.js advisory ranges.** Most don't apply (no `next/image`, no Pages Router/i18n, no middleware redirects). Pinned to latest patched 14.2.x; criticals cleared; majors tracked. See SECURITY.md § Dependency advisories. |
| F6 | Info | Accepted | **No logging/monitoring** is a deliberate privacy trade-off (A09); operators needing audit logs must add their own without capturing prompts/keys/PII. |

No critical or high findings in first-party application code at assessment time.

## 10. Recommendations / roadmap

- Add Subresource Integrity story if any external asset is ever introduced (none today).
- Consider tightening `style-src` by migrating inline styles to CSS modules (removes F3).
- For operator deployments: front the proxy with platform rate-limiting/WAF (addresses F2).
- Re-run this assessment each release and on major dependency upgrades (esp. Next.js majors).
- Welcome an independent third-party review as the project matures.

## 11. Disclaimer

This document reflects the state of the code at the date above and is provided in
good faith. It is not a warranty. Security is ongoing — please report issues
responsibly via [SECURITY.md](../SECURITY.md).
