import { getPromptApi } from './capability';
import { ProviderError, type GenerateInput, type LLMProvider } from './types';
import type { OnDeviceBackend } from '@/data/db';

// EXPERIMENTAL, keyless, on-device. Three honest backends:
//   - 'prompt-api'    → Chrome's built-in LanguageModel (downloads once, then offline)
//   - 'custom-openai' → a local OpenAI-compatible server (Ollama / LM Studio), no key
//   - 'webllm'        → WebGPU in-browser model (lazy-loaded; not bundled — see note)
// Never the default; always offered with a cloud fallback.
export function ondeviceProvider(backend: OnDeviceBackend, endpoint?: string): LLMProvider {
  return {
    id: 'ondevice',
    label: 'On-device cook',
    async generate(input: GenerateInput): Promise<string> {
      if (backend === 'prompt-api') return generatePromptApi(input);
      if (backend === 'custom-openai') return generateCustomOpenAI(input, endpoint);
      // WebLLM is intentionally not bundled (it pulls ~1GB+ of weights from a CDN,
      // which the strict CSP would block). When a self-hosted WebLLM build is added,
      // import it lazily here. For now, steer to a supported backend.
      throw new ProviderError(
        'This on-device engine isn’t set up yet — use a cloud key or a local OpenAI-compatible server.',
        'unsupported'
      );
    },
  };
}

async function generatePromptApi({ system, user, onDownloadProgress }: GenerateInput): Promise<string> {
  const lm = getPromptApi();
  if (!lm) throw new ProviderError('This phone doesn’t have an on-device model.', 'unsupported');
  try {
    // The download (if any) happens inside create(); we forward the REAL
    // downloadprogress events so the UI can show honest one-time progress.
    const session = (await lm.create({
      initialPrompts: system ? [{ role: 'system', content: system }] : [],
      monitor(m: EventTarget) {
        m.addEventListener('downloadprogress', (e: Event) => {
          const loaded = (e as Event & { loaded?: number }).loaded;
          if (typeof loaded === 'number' && onDownloadProgress) onDownloadProgress(loaded);
        });
      },
    })) as {
      prompt: (s: string) => Promise<string>;
    };
    const text = (await session.prompt(user)).trim();
    if (!text) throw new ProviderError('The on-device cook came back empty.', 'unknown');
    return text;
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    throw new ProviderError(err instanceof Error ? err.message : 'On-device model failed.', 'unknown');
  }
}

async function generateCustomOpenAI({ system, user, signal }: GenerateInput, endpoint?: string): Promise<string> {
  if (!endpoint) throw new ProviderError('No local server URL set.', 'unsupported');
  const base = endpoint.replace(/\/+$/, '');
  let res: Response;
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'local',
        messages: [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: user }],
        max_tokens: 2000,
      }),
      signal,
    });
  } catch {
    throw new ProviderError('Couldn’t reach your local server.', 'network');
  }
  if (!res.ok) throw new ProviderError('Local server returned an error.', 'unknown');
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = (data.choices?.[0]?.message?.content ?? '').trim();
  if (!text) throw new ProviderError('Local server came back empty.', 'unknown');
  return text;
}
