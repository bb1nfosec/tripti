import type { ProviderConfig, ProviderType } from '@/data/db';
import { ProviderError, type LLMProvider } from './types';
import { anthropicProvider, validateAnthropicKey } from './anthropic';
import { openaiProvider, validateOpenAIKey } from './openai';
import { geminiProvider, validateGeminiKey } from './gemini';
import { groqProvider, validateGroqKey } from './groq';
import { sharedProvider } from './proxy';
import { ondeviceProvider } from './ondevice';

export * from './types';
export { checkOnDeviceCapability } from './capability';
export type { OnDeviceCapability } from './capability';
export { isSharedAccessEnabled } from './proxy';

// Build the live provider from the stored config (key from IndexedDB).
export function makeProvider(cfg: ProviderConfig): LLMProvider {
  switch (cfg.type) {
    case 'anthropic':
      if (!cfg.apiKey) throw new ProviderError('No Anthropic key saved.', 'auth');
      return anthropicProvider(cfg.apiKey, cfg.model);
    case 'openai':
      if (!cfg.apiKey) throw new ProviderError('No OpenAI key saved.', 'auth');
      return openaiProvider(cfg.apiKey, cfg.model);
    case 'gemini':
      if (!cfg.apiKey) throw new ProviderError('No Gemini key saved.', 'auth');
      return geminiProvider(cfg.apiKey, cfg.model);
    case 'groq':
      if (!cfg.apiKey) throw new ProviderError('No Groq key saved.', 'auth');
      return groqProvider(cfg.apiKey, cfg.model);
    case 'shared':
      // Operator key lives server-side only; nothing to read here.
      return sharedProvider();
    case 'ondevice':
      return ondeviceProvider(cfg.onDeviceBackend ?? 'prompt-api', cfg.endpoint);
  }
}

// Validate + confirm a cloud/free key works before we save it.
export function validateKey(type: ProviderType, apiKey: string, model?: string): Promise<void> {
  switch (type) {
    case 'anthropic':
      return validateAnthropicKey(apiKey, model);
    case 'openai':
      return validateOpenAIKey(apiKey, model);
    case 'gemini':
      return validateGeminiKey(apiKey, model);
    case 'groq':
      return validateGroqKey(apiKey, model);
    case 'shared':
    case 'ondevice':
      return Promise.resolve(); // keyless
  }
}
