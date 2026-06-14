import Anthropic from '@anthropic-ai/sdk';
import { DEFAULT_MODELS, ProviderError, type GenerateInput, type LLMProvider } from './types';

// Anthropic runs browser-direct: the key stays in this page and the request goes
// straight to api.anthropic.com (allowed in the CSP connect-src). The SDK sets
// the `anthropic-dangerous-direct-browser-access` header when dangerouslyAllowBrowser
// is on. There is no server in the middle for this provider.
export function anthropicProvider(apiKey: string, model = DEFAULT_MODELS.anthropic): LLMProvider {
  return {
    id: 'anthropic',
    label: 'Anthropic',
    async generate({ system, user, signal }: GenerateInput): Promise<string> {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      try {
        // Thinking omitted → Opus 4.8 answers directly, which is what we want for
        // a single small JSON reply. One call, no tools, no chain.
        const res = await client.messages.create(
          {
            model,
            max_tokens: 2000,
            system,
            messages: [{ role: 'user', content: user }],
          },
          { signal }
        );
        const text = res.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('\n')
          .trim();
        if (!text) throw new ProviderError('Empty response from Anthropic', 'unknown');
        return text;
      } catch (err) {
        throw mapAnthropicError(err);
      }
    },
  };
}

export async function validateAnthropicKey(apiKey: string, model = DEFAULT_MODELS.anthropic): Promise<void> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    // Smallest possible probe — one token is plenty to confirm the key works.
    await client.messages.create({
      model,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'hi' }],
    });
  } catch (err) {
    throw mapAnthropicError(err);
  }
}

function mapAnthropicError(err: unknown): ProviderError {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return new ProviderError('That key didn’t go through.', 'auth');
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return new ProviderError('Couldn’t reach Anthropic.', 'network');
  }
  if (err instanceof ProviderError) return err;
  return new ProviderError(err instanceof Error ? err.message : 'Something went wrong.', 'unknown');
}
