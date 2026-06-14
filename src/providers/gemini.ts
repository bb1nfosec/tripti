import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_MODELS, ProviderError, type GenerateInput, type LLMProvider } from './types';

// Gemini's native SDK calls generativelanguage.googleapis.com directly from the
// browser (CORS-allowed, key in the request). Allowed in the CSP connect-src.
export function geminiProvider(apiKey: string, model = DEFAULT_MODELS.gemini): LLMProvider {
  return {
    id: 'gemini',
    label: 'Gemini',
    async generate({ system, user, signal }: GenerateInput): Promise<string> {
      const genAI = new GoogleGenerativeAI(apiKey);
      const m = genAI.getGenerativeModel({ model, systemInstruction: system });
      try {
        const result = await m.generateContent(
          { contents: [{ role: 'user', parts: [{ text: user }] }] },
          { signal }
        );
        const text = result.response.text().trim();
        if (!text) throw new ProviderError('Empty response from Gemini.', 'unknown');
        return text;
      } catch (err) {
        throw mapGeminiError(err);
      }
    },
  };
}

export async function validateGeminiKey(apiKey: string, model = DEFAULT_MODELS.gemini): Promise<void> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const m = genAI.getGenerativeModel({ model });
  try {
    await m.generateContent('hi');
  } catch (err) {
    throw mapGeminiError(err);
  }
}

function mapGeminiError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const raw = err instanceof Error ? err.message : String(err);
  // Pull a short, human-readable detail out of the SDK's verbose wrapper.
  const detail = raw.replace(/^\[GoogleGenerativeAI Error\]:\s*/i, '').replace(/\s+/g, ' ').trim().slice(0, 180);

  if (/API_KEY_INVALID|api[_ ]?key|permission|PERMISSION_DENIED|401|403/i.test(raw)) {
    return new ProviderError(`That key didn’t go through. (${detail})`, 'auth');
  }
  if (/quota|RESOURCE_EXHAUSTED|rate|429/i.test(raw)) {
    return new ProviderError(`Gemini is rate-limited right now. (${detail})`, 'network');
  }
  if (/location|region|not supported|FAILED_PRECONDITION|billing/i.test(raw)) {
    return new ProviderError(`Gemini isn’t available for this account/region: ${detail}`, 'unknown');
  }
  if (/not found|NOT_FOUND|404/i.test(raw)) {
    return new ProviderError(`That model isn’t available for this key: ${detail}`, 'unknown');
  }
  if (/failed to fetch|networkerror|load failed|fetch/i.test(raw)) {
    return new ProviderError(`Couldn’t reach Gemini (network/CORS). ${detail}`, 'network');
  }
  return new ProviderError(detail || 'Gemini had a problem.', 'unknown');
}
