# Contributing to Tripti

Thank you for helping make Tripti better! This is a calm, local-first project for
real households — contributions that keep it warm, honest, and private are very
welcome.

## Ways to help

- 🍲 **Cuisines & recipes** — more regional baselines and sourcing catalogs.
- 🌐 **Translations** — improve EN / Hinglish / हिंदी copy, or add a language.
- 📷 **Food photography** — the dish cards use striped placeholders today.
- ♿ **Accessibility** — larger targets, screen-reader labels, contrast.
- 🤖 **Providers** — more BYOLLM options, better on-device support.
- 🐛 **Bugs & docs** — fixes and clearer explanations.

## Development setup

```bash
npm install
npm run dev        # http://localhost:3000
```

Before opening a PR, make sure these pass:

```bash
npm run typecheck  # tsc --noEmit, must be clean
npm run lint       # next lint
npm run build      # production build must succeed
```

## Project conventions

- **Read [ARCHITECTURE.md](ARCHITECTURE.md) first.** Keep the layering: UI →
  orchestration → data/providers → pure helpers. Don't import upward.
- **One LLM call per action.** No agents, orchestration loops, chains, or a second
  model. If a feature seems to need more, open an issue to discuss first.
- **Validate untrusted input at the boundary** with zod, and **sanitize free text
  twice** — for prompt injection (`sanitizeForPrompt`) and for XSS (`cleanText`).
  Never use `dangerouslySetInnerHTML`.
- **Never log or persist** keys, prompts, or household data. No telemetry. If usage
  signals are ever proposed, they must be local-only and opt-in.
- **Keep the CSP strict** — no new CDNs or `<script>` tags; self-host any asset.
- **Match the visual system** in `src/lib/tokens.ts` (sage / clay / honey on cream;
  Newsreader for dish names, Hanken Grotesk for UI). Motion is gentle (~150–250ms,
  transform/opacity only) with a `prefers-reduced-motion` fallback.
- **Honest, warm microcopy.** Never preachy about health; defer medical numbers to
  the user's doctor.

## Commit & PR flow

1. Fork and create a branch: `git checkout -b feat/short-description`.
2. Make focused commits with clear messages (Conventional Commits encouraged:
   `feat:`, `fix:`, `docs:`, `refactor:`…).
3. Run the checks above.
4. Open a PR against `main`, fill in the template, and link any related issue.

### Secret scanning

CI runs [gitleaks](https://github.com/gitleaks/gitleaks) on every PR and `npm audit`
on dependencies. To catch secrets before they leave your machine, install the
pre-commit hook (optional but recommended):

```bash
pipx install pre-commit   # or: pip install pre-commit
pre-commit install        # uses .pre-commit-config.yaml (gitleaks)
```

**Never commit a real API key.** Use the app's UI to enter keys; for operator setup
use environment variables (see `.env.example`), never source files.

## Reporting security issues

Please **do not** open a public issue for vulnerabilities. Follow
[SECURITY.md](SECURITY.md).

## Code of Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
