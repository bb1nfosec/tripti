import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Stateless proxy for the providers that browser-CORS blocks (OpenAI, Groq) plus
// the operator "shared test access" path. Security posture (matches the project's
// secure-coding rules):
//   - validates + length-caps the body with zod at the boundary
//   - forwards the user's key for ONE request; holds none of its own
//   - the operator key is read ONLY from server env, never sent to the client
//   - logs NOTHING (no key, prompt, or household data anywhere)
//   - strips upstream secrets/stack traces from error responses
//   - rate-limited per IP, and same-origin only (no open relay)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
} as const;
type Target = keyof typeof ENDPOINTS;

// Operator-provided shared access. Configured only via server env; absent by default.
const OP_KEY = process.env.TRIPTI_OPERATOR_KEY ?? '';
const OP_TARGET = (process.env.TRIPTI_OPERATOR_TARGET as Target | undefined) ?? 'groq';
const OP_MODEL = process.env.TRIPTI_OPERATOR_MODEL ?? 'llama-3.3-70b-versatile';

const BodySchema = z.object({
  mode: z.enum(['generate', 'validate', 'operator']),
  target: z.enum(['openai', 'groq']).optional(),
  apiKey: z.string().min(1).max(400).optional(),
  model: z.string().min(1).max(120).optional(),
  system: z.string().max(8000).optional(),
  user: z.string().max(8000).optional(),
});

// Best-effort per-IP rate limit (per serverless instance — not a global guarantee,
// but it caps abuse and protects the operator key).
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string, max: number): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > max;
}

function clientIp(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for')?.split(',')[0] ?? '').trim() || 'local';
}

// Reject obvious cross-site use (browsers send Origin on cross-origin POSTs).
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin fetches may omit it
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}

// Expose ONLY whether shared access is enabled — never the key.
export async function GET() {
  return NextResponse.json({ sharedAccess: OP_KEY.length > 0 });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const isOperator = parsed.mode === 'operator';
  // Tighter limit on the operator key than on BYO requests.
  if (rateLimited(clientIp(req), isOperator ? 8 : 24)) {
    return NextResponse.json({ error: 'Slow down a moment.' }, { status: 429 });
  }

  // Resolve target + key + model. Operator path never trusts client key/target.
  let target: Target;
  let key: string;
  let model: string;
  if (isOperator) {
    if (!OP_KEY) return NextResponse.json({ error: 'Shared access is off.' }, { status: 403 });
    target = OP_TARGET;
    key = OP_KEY;
    model = OP_MODEL;
  } else {
    if (!parsed.target || !parsed.apiKey) {
      return NextResponse.json({ error: 'Missing key or target' }, { status: 400 });
    }
    target = parsed.target;
    key = parsed.apiKey;
    model = parsed.model ?? 'llama-3.3-70b-versatile';
  }

  const isValidate = parsed.mode === 'validate';
  const messages = [
    ...(parsed.system ? [{ role: 'system', content: parsed.system }] : []),
    { role: 'user', content: parsed.user ?? 'hi' },
  ];

  let upstream: Response;
  try {
    upstream = await fetch(ENDPOINTS[target], {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, max_tokens: isValidate ? 1 : 2000, messages }),
    });
  } catch {
    return NextResponse.json({ error: 'Upstream unreachable' }, { status: 502 });
  }

  // Map upstream status WITHOUT echoing its body (which we don't trust to be
  // secret-free) — domestic, generic messages only.
  if (upstream.status === 401 || upstream.status === 403) {
    return NextResponse.json({ error: 'Auth failed' }, { status: upstream.status });
  }
  if (upstream.status === 429) {
    return NextResponse.json({ error: 'Provider is rate-limiting.' }, { status: 429 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: 'Provider error' }, { status: upstream.status >= 500 ? 502 : 400 });
  }

  if (isValidate) return NextResponse.json({ ok: true });

  const data = (await upstream.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? '';
  return NextResponse.json({ text });
}
