import { ProviderError, type GenerateInput, type LLMProvider } from './types';
import type { ProviderType } from '@/data/db';

// Shared client for every provider that must go through the same-origin /api/llm
// proxy: OpenAI and Groq (browser CORS blocks them), plus the operator "shared"
// path (no client key at all — the server injects its env key). The proxy holds
// nothing, logs nothing, and forwards a single request.
export type ProxyTarget = 'openai' | 'groq';

interface ProxyBody {
  mode: 'generate' | 'validate' | 'operator';
  target?: ProxyTarget;
  apiKey?: string;
  model?: string;
  system?: string;
  user?: string;
}

async function callProxy(body: ProxyBody, signal?: AbortSignal): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ProviderError('Couldn’t reach the proxy.', 'network');
  }
  if (res.status === 401 || res.status === 403) throw new ProviderError('That key didn’t go through.', 'auth');
  if (res.status === 429) throw new ProviderError('Too many tries just now — give it a moment.', 'network');
  if (!res.ok) {
    // The proxy already strips upstream secrets/stack traces.
    const msg = await res.text().catch(() => '');
    throw new ProviderError(msg || 'The request didn’t go through.', res.status >= 500 ? 'network' : 'unknown');
  }
  const data = (await res.json().catch(() => ({}))) as { text?: string };
  if (!data.text) throw new ProviderError('Empty response.', 'unknown');
  return data.text;
}

// BYO free-tier / cloud key (OpenAI, Groq) routed through the proxy.
export function proxyProvider(id: ProviderType, target: ProxyTarget, apiKey: string, model: string, label: string): LLMProvider {
  return {
    id,
    label,
    generate: ({ system, user, signal }: GenerateInput) =>
      callProxy({ mode: 'generate', target, apiKey, model, system, user }, signal),
  };
}

export async function validateProxyKey(target: ProxyTarget, apiKey: string, model: string): Promise<void> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'validate', target, apiKey, model } satisfies ProxyBody),
  }).catch(() => {
    throw new ProviderError('Couldn’t reach the proxy.', 'network');
  });
  if (res.status === 401 || res.status === 403) throw new ProviderError('That key didn’t go through.', 'auth');
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new ProviderError(msg || 'That key didn’t work.', 'unknown');
  }
}

// Operator-provided "shared test access" — the server uses its own env key; the
// client sends no key and never learns one. generate() carries no target/apiKey.
export function sharedProvider(): LLMProvider {
  return {
    id: 'shared',
    label: 'Shared test access',
    generate: ({ system, user, signal }: GenerateInput) =>
      callProxy({ mode: 'operator', system, user }, signal),
  };
}

// Is operator/shared access switched on? Reads only a boolean — never a key.
export async function isSharedAccessEnabled(): Promise<boolean> {
  try {
    const res = await fetch('/api/llm', { method: 'GET' });
    if (!res.ok) return false;
    const data = (await res.json()) as { sharedAccess?: boolean };
    return !!data.sharedAccess;
  } catch {
    return false;
  }
}
