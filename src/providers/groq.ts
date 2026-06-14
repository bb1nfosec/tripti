import { DEFAULT_MODELS, type LLMProvider } from './types';
import { proxyProvider, validateProxyKey } from './proxy';

// Groq — OpenAI-compatible, generous free tier. Routed through the /api/llm
// proxy (Groq doesn't allow browser-direct CORS). Get a free key at
// https://console.groq.com/keys.
export function groqProvider(apiKey: string, model = DEFAULT_MODELS.groq): LLMProvider {
  return proxyProvider('groq', 'groq', apiKey, model, 'Groq');
}

export function validateGroqKey(apiKey: string, model = DEFAULT_MODELS.groq): Promise<void> {
  return validateProxyKey('groq', apiKey, model);
}
