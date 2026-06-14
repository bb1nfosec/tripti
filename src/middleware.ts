import { NextRequest, NextResponse } from 'next/server';

// Strict Content-Security-Policy with a per-request nonce for scripts.
// Next.js automatically attaches this nonce to the framework's own <script>
// tags when it sees a `nonce-…` in the CSP request header, so we keep
// script-src locked to 'self' + nonce with ZERO third-party script origins.
//
// connect-src is the only place we open outward, and only to the BYOLLM
// endpoints the app talks to directly:
//   - 'self'                              → the /api/llm OpenAI proxy + same-origin fetches
//   - https://api.anthropic.com           → Anthropic browser-direct
//   - https://generativelanguage.googleapis.com → Gemini native SDK
//   - http://localhost / 127.0.0.1        → experimental on-device OpenAI-compatible servers
// OpenAI is intentionally absent here: it is reached through the same-origin
// proxy so the key never crosses CORS and the browser never talks to OpenAI directly.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';

  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}'`;

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    // Inline style attributes are used throughout the UI; styles are far lower
    // risk than scripts and carry no third-party origins.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self' https://api.anthropic.com https://generativelanguage.googleapis.com http://localhost:* http://127.0.0.1:*`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', csp);
  return response;
}

export const config = {
  // Skip static assets and the service worker so they are served plainly.
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
