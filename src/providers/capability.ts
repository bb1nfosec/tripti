// Capability probe for the EXPERIMENTAL on-device path. Honest by design:
// we tell the UI exactly what this device can and can't do, and the app always
// offers a cloud fallback.

export interface OnDeviceCapability {
  webgpu: boolean; // navigator.gpu present (needed by WebLLM)
  promptApi: boolean; // Chrome built-in Prompt API (window.LanguageModel / window.ai)
  // The honest recommendation: which on-device backend, if any, is viable here.
  recommended: 'prompt-api' | 'webllm' | 'custom-openai' | 'none';
}

declare global {
  // Chrome's experimental built-in model surfaces.
  interface Window {
    LanguageModel?: { availability?: () => Promise<string>; create?: (o?: unknown) => Promise<unknown> };
    ai?: { languageModel?: { availability?: () => Promise<string>; create?: (o?: unknown) => Promise<unknown> } };
  }
}

export function getPromptApi(): { create: (o?: unknown) => Promise<unknown> } | null {
  if (typeof window === 'undefined') return null;
  const lm = window.LanguageModel ?? window.ai?.languageModel;
  if (lm && typeof lm.create === 'function') return lm as { create: (o?: unknown) => Promise<unknown> };
  return null;
}

export async function checkOnDeviceCapability(): Promise<OnDeviceCapability> {
  if (typeof navigator === 'undefined') {
    return { webgpu: false, promptApi: false, recommended: 'none' };
  }
  const webgpu = 'gpu' in navigator && !!(navigator as Navigator & { gpu?: unknown }).gpu;
  const promptApi = getPromptApi() !== null;

  let recommended: OnDeviceCapability['recommended'] = 'none';
  if (promptApi) recommended = 'prompt-api';
  else if (webgpu) recommended = 'webllm';

  return { webgpu, promptApi, recommended };
}
