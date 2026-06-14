import { DEFAULT_MODELS, type LLMProvider } from './types';
import { proxyProvider, validateProxyKey } from './proxy';

// OpenAI's browser CORS policy blocks direct calls, so it goes through the
// same-origin /api/llm proxy. The proxy forwards and never stores/logs the key.
export function openaiProvider(apiKey: string, model = DEFAULT_MODELS.openai): LLMProvider {
  return proxyProvider('openai', 'openai', apiKey, model, 'OpenAI');
}

export function validateOpenAIKey(apiKey: string, model = DEFAULT_MODELS.openai): Promise<void> {
  return validateProxyKey('openai', apiKey, model);
}
