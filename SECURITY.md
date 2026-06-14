# Security Policy

Tripti is a local-first, privacy-first project. We take security seriously and
welcome responsible disclosure.

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Instead, open a private report via GitHub:
[**Report a vulnerability**](https://github.com/bb1nfosec/tripti/security/advisories/new)
(Security → Advisories → "Report a vulnerability").

Please include:

- A description of the issue and its impact
- Steps to reproduce (a proof of concept if possible)
- The affected version / commit and environment

We aim to acknowledge reports within a few days and to keep you updated as we work
on a fix. We'll credit you in the advisory unless you prefer to remain anonymous.

## Scope & threat model

Because Tripti runs in the browser with the user's provider key in the page, the
relevant risks include:

- **XSS / injection** — all free text is sanitized for prompt injection before it
  reaches the model and for XSS before render; LLM output is validated through a
  zod schema; we never use `dangerouslySetInnerHTML` or `eval`.
- **Key exposure** — the user's key lives only in IndexedDB; it is never written to
  logs, analytics, error trackers, or query strings. Error messages are stripped of
  secrets before display.
- **The `/api/llm` proxy** — forwards the user's key for a single request, stores
  nothing, logs nothing, is same-origin-only, and is rate-limited. The optional
  operator key is read only from server environment variables and is never sent to
  the client.
- **CSP** — strict `default-src 'self'` with a per-request script nonce,
  `connect-src` limited to the chosen provider endpoints, self-hosted fonts, and no
  third-party scripts.

### Out of scope

- Vulnerabilities in third-party AI providers or in a user's own self-hosted /
  on-device model server.
- Risks a user accepts by pasting a key into a browser on a device they don't trust
  (the app is explicit that a stored key is "only as safe as your phone").

## Supported versions

This is an actively developed project; security fixes target the `main` branch and
the latest release.
