import AppClient from '@/components/AppClient';

// Render per-request (not statically prerendered) so the strict-CSP nonce set by
// middleware is injected into Next's scripts. Without this the route is static,
// the nonce never reaches the HTML, and CSP blocks hydration → blank screen.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <AppClient />;
}
