# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims to
follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release: local-first, BYOLLM food companion PWA.
- Tonight's meal suggestion with the full state matrix (thinking, on-device
  download, call-failed, parse-fallback, offline).
- Honest feedback loop (Yes / Almost / No) that updates the local profile.
- Six-month provisioning plan with a live budget envelope.
- Gentle, member-aware health review with a doctor-deferral and its own state matrix.
- Sourcing list/map with bulk-vs-fresh and storage tips.
- Providers: Anthropic, OpenAI, Gemini, Groq (free tier), experimental on-device,
  and an operator-gated "shared test access".
- EN / Hinglish / हिंदी language toggle.
- Security program: strict CSP, secure proxy, sanitization, zod boundaries; CodeQL,
  gitleaks, `npm audit`, Dependabot, dependency review; a security self-assessment
  mapped to NIST SSDF + OWASP.
- Contributor guides (design + engineering), architecture docs, and community files.

[Unreleased]: https://github.com/bb1nfosec/tripti/commits/main
