<div align="center">

<img src="public/brand/tripti-mark.svg" width="84" height="84" alt="Tripti logo" />

# Tripti

**A calm, local-first food companion for Indian households.**
"What shall we cook tonight?" — answered with what's already in your kitchen.

[![CI](https://github.com/bb1nfosec/tripti/actions/workflows/ci.yml/badge.svg)](https://github.com/bb1nfosec/tripti/actions/workflows/ci.yml)
[![CodeQL](https://github.com/bb1nfosec/tripti/actions/workflows/codeql.yml/badge.svg)](https://github.com/bb1nfosec/tripti/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-5F7D5A.svg)](LICENSE)
[![Security self-assessment](https://img.shields.io/badge/security-self--assessment-5F7D5A.svg)](docs/SECURITY_AUDIT.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-5F7D5A.svg)](CONTRIBUTING.md)

**[Live demo →](https://tripti-eight.vercel.app)** · bring your own free key (or the on-device option)

<sub>🔑 The demo ships **no** API key — you supply your own in the app. Never deploy or share an instance with a live key baked in.</sub>

</div>

---

Tripti (तृप्ति — *the deep satisfaction of being well-fed and cared for*) is a
[PWA](https://web.dev/explore/progressive-web-apps) that suggests one honest meal
for tonight, helps plan a calm six-month grocery stock-up, and gives the plan a
gentle health-and-budget review. It behaves like a trusted family friend who knows
your house — **not** a macro tracker, not a clinical diet app, not a gamified coach.

It is **local-first** and **bring-your-own-LLM**:

- 🔒 **Your data never leaves your device.** Household profile, meal history, plan
  and API key all live in your browser's IndexedDB. Tripti runs no servers and has
  no accounts.
- 🤝 **You pick the AI.** Use a free key (Groq, Gemini free tier), a paid key
  (Anthropic, OpenAI), an experimental on-device model (no key at all), or — if an
  operator enables it — a shared test key.
- 📴 **Offline-friendly.** History, saved recipes, the provisioning plan and budget
  stay fully usable offline; only a *new* AI suggestion needs a provider.

> ⚠️ Tripti is a community project and an AI assistant. It is **not medical advice.**
> Your doctor sets any health targets, portions, or restrictions — Tripti only
> sources around them.

## 💛 The cause

> **"Aaj kya banaye?" — *what shall we cook today?* — is asked in millions of Indian
> kitchens every single evening, usually by someone tired, often alone with the
> decision, on a budget that matters.**

Tripti exists to take a little weight off that moment — **care, not optimization.**

- **Ease the daily decision.** One honest suggestion from what's already in the
  kitchen, in ~30 seconds. "Ah okay, manageable."
- **Respect the budget.** A calm six-month sourcing plan and honest cost estimates,
  money shown *without anxiety* — never a red diet-style warning.
- **Be health-aware, not preachy.** Gentle, member-aware swaps that always defer the
  numbers to the family's own doctor. Never imply a family eats "wrong."
- **Keep it private and free to start.** A household's health and budget are deeply
  personal. Tripti runs no servers, keeps everything on the device, and lets people
  start free — bringing their own AI, or none at all.
- **Meet real kitchens where they are.** Mobile-first, one-handed, readable at
  arm's length, in English / Hinglish / हिंदी.

If that resonates, [contributions are welcome](CONTRIBUTING.md) — especially regional
cuisines, translations, accessibility, and food photography.

## ✨ Features

- **Tonight's idea** — tap what's in the kitchen, get one suggestion: the dish,
  why it fits *your* house, an honest cost + confidence, ingredients, steps, a
  leftover idea, and a calm backup when confidence is low.
- **Honest feedback loop** — Yes / Almost / No teaches Tripti your household
  (stored locally): Yes → meal history, No → avoid, Almost → one clarifying note.
- **Six-month provisioning plan** — a warm, collapsible grocery plan with live
  budget recompute, where-to-buy, and bulk-vs-fresh guidance.
- **Gentle health review** — member-aware sourcing swaps you accept or wave off,
  always deferring medical numbers to your doctor.
- **Sourcing map** — where to buy what, with monsoon-aware storage tips.
- **EN / Hinglish / हिंदी** language toggle throughout.

## 🚀 Quick start

```bash
git clone https://github.com/bb1nfosec/tripti.git
cd tripti
npm install
npm run dev            # http://localhost:3000
```

Then in the app: pick a language → choose how Tripti thinks (the easiest path is a
free **Groq** key from [console.groq.com/keys](https://console.groq.com/keys), or
the on-device option for no key at all) → do the 90-second onboarding → cook.

No environment variables are required. See [`.env.example`](.env.example) for the
optional operator "shared test access" setup.

```bash
npm run build && npm run start   # production
npm run typecheck                # tsc --noEmit
npm run lint                     # next lint
```

## 🛠️ Build & deploy your own Tripti

Tripti is yours to run — fork it, brand it, and host your own instance. You need
[Node.js 18+](https://nodejs.org) and npm.

### 1. Get the code

```bash
git clone https://github.com/bb1nfosec/tripti.git    # or your fork
cd tripti
npm install
```

### 2. Run it locally

```bash
npm run dev        # development at http://localhost:3000
```

### 3. Build for production

```bash
npm run build      # compiles an optimized build into .next/
npm run start      # serves the production build at http://localhost:3000
```

That's a complete, working app already — no API keys or env vars needed to build or
boot. Each user supplies their own AI key in the UI (or uses the on-device option).

### 4. Deploy it

Tripti is a standard Next.js app (it uses one API route + middleware), so it runs on
any host that supports Next.js server output.

**Vercel (easiest):**

```bash
npm i -g vercel
vercel            # first run links/creates the project (preview)
vercel --prod     # deploy to production → gives you a public HTTPS URL
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bb1nfosec/tripti)

**Self-host (any Node server / container):**

```bash
npm run build
npm run start -- -H 0.0.0.0 -p 3000   # put it behind your own HTTPS reverse proxy
```

> HTTPS is required for the PWA to install and for offline/on-device features
> (browsers only enable those in a secure context). `localhost` counts as secure for
> local testing.

### 5. Install it as an app

Open your deployed HTTPS URL on a phone → browser menu → **Add to Home Screen**.
It installs like a native app, with an icon and offline support.

### 6. (Optional) Offer free "shared test access"

If you want people to try *your* instance with **no key at all**, set a server-side
operator key (e.g. a free [Groq](https://console.groq.com/keys) key). It is read
only on the server and is **never** sent to the browser; the "Shared test access"
option stays hidden until you set it.

```bash
# locally: create .env.local (git-ignored)
echo 'TRIPTI_OPERATOR_KEY=gsk_your_free_groq_key' > .env.local

# on Vercel:
vercel env add TRIPTI_OPERATOR_KEY production
vercel --prod
```

See [`.env.example`](.env.example) for all operator options.

> 🔑 **Never put a live API key in the repo or the client bundle.** Keys belong in
> server-side environment variables only (and `.env*` files are git-ignored). A
> public demo deployed from this repo carries **no** committed key — visitors bring
> their own, or the operator wires a key via env. Don't share a deployed URL that has
> a live key baked in, and never paste a key into source, issues, or screenshots.
> CI runs **gitleaks** to help catch accidental commits.

## 🧱 Architecture

A clean, layered, browser-only app. Full detail in [ARCHITECTURE.md](ARCHITECTURE.md).

```
src/
├── app/            Next.js App Router: layout, root page, /api/llm proxy, globals
├── middleware.ts   Strict, nonce-based Content-Security-Policy
├── components/     Reusable UI + the app shell/state machine (App.tsx)
├── screens/        One file per screen (entry, provider, onboarding, hero, …)
├── data/           Dexie schema + repository accessors + provisioning catalog
├── providers/      BYOLLM abstraction (Anthropic / OpenAI / Gemini / Groq / on-device / shared)
├── prompt/         Prompt builder (profile + context → prompt)
├── llm/            Typed zod schemas, response parsing, one-call orchestration
└── lib/            Design tokens, i18n, sanitization, hooks
```

Principles: **exactly one LLM call per action** (no agents/chains), **typed
boundaries** (zod for every LLM response), **fail safe and quiet** (degrade to the
local path on any uncertainty), and a **strict CSP with zero third-party scripts**.

## 🔐 Security & privacy

Tripti is built by and for security-minded people. Highlights:

- Strict CSP with a per-request nonce; `connect-src` limited to the chosen provider
  endpoints; self-hosted fonts; no third-party scripts; sensible security headers.
- All free text is sanitized twice — against **prompt injection** before it reaches
  the model, and against **XSS** before render (the API key lives in the page).
- Every LLM response is validated through a zod schema; malformed output degrades to
  a safe local fallback, never `eval`.
- The `/api/llm` proxy (for CORS-blocked providers) forwards the user's key for one
  request, stores nothing, logs nothing, is same-origin-only and rate-limited. The
  operator key is read only from server env and is never client-readable.

### Security testing & standards

This project is built to a documented standard and continuously tested:

- 📋 **[Security self-assessment](docs/SECURITY_AUDIT.md)** — threat model, control
  verification, findings, and residual risks, mapped to **NIST SSDF (SP 800-218)**
  and **OWASP** (Top 10 2021, ASVS, Secure Coding Practices).
- 🔎 **SAST** — [CodeQL](.github/workflows/codeql.yml) (`security-and-quality`) on
  every push/PR + weekly.
- 🕵️ **Secret scanning** — [gitleaks](.github/workflows/ci.yml) in CI and an optional
  pre-commit hook.
- 📦 **Supply chain** — `npm audit` (gates on production-critical),
  [Dependabot](.github/dependabot.yml), and
  [dependency review](.github/workflows/dependency-review.yml) on PRs; pinned lockfile.
- ✅ **Quality gates** — strict `tsc`, `next lint`, and a clean production build.

See [SECURITY.md](SECURITY.md) for the threat model summary, the dependency-advisory
policy, and how to report a vulnerability.

## 🤝 Contributing

Contributions are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md). Good first areas: real food photography,
more regional cuisines, translations, accessibility, and on-device model support.

**New to open source? Students especially welcome** 🌱 — start with the gentle,
jargon-free [**Getting Started guide**](docs/GETTING_STARTED.md): install the tools,
understand "what is what," and make your first pull request step by step.

Standards-based guides for contributors:

- 🌱 [Getting Started (beginners)](docs/GETTING_STARTED.md) — your first contribution, explained simply.
- 🎨 [Design Guidelines](docs/DESIGN_GUIDELINES.md) — the visual system, motion, tone.
- 🧑‍💻 [Engineering Guidelines](docs/ENGINEERING_GUIDELINES.md) — coding standards,
  security must-dos, quality gates, Definition of Done.

> Note: `main` is protected — all changes land via pull request with green status
> checks and a linear history; force-pushes and branch deletion are disabled.

## 🙏 Credits

Visual identity and screen designs were created with
[Claude Design](https://claude.ai/design) and implemented here. Built with Next.js,
React, Dexie, and zod.

## 📄 License

[MIT](LICENSE) © Tripti contributors.
