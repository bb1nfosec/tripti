import type { ProviderType } from '@/data/db';

// One small interface every provider implements: take a system + user prompt,
// return raw text (which parse.ts then validates as a Suggestion).
// No streaming, no tools, no multi-call chains — a single call, by design.
export interface GenerateInput {
  system: string;
  user: string;
  signal?: AbortSignal;
  // On-device only: real download progress (0–1) for the one-time model fetch.
  // Cloud providers ignore it.
  onDownloadProgress?: (fraction: number) => void;
}

export interface LLMProvider {
  id: ProviderType;
  label: string;
  generate(input: GenerateInput): Promise<string>;
}

export class ProviderError extends Error {
  // 'auth' → bad/missing key; 'network' → couldn't reach; 'unsupported' → capability missing.
  kind: 'auth' | 'network' | 'unsupported' | 'unknown';
  constructor(message: string, kind: ProviderError['kind'] = 'unknown') {
    super(message);
    this.name = 'ProviderError';
    this.kind = kind;
  }
}

export const DEFAULT_MODELS: Record<ProviderType, string> = {
  anthropic: 'claude-opus-4-8',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  groq: 'llama-3.3-70b-versatile',
  shared: 'llama-3.3-70b-versatile', // operator may override server-side
  ondevice: 'on-device',
};
