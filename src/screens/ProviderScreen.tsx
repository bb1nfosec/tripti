'use client';

import { useEffect, useState } from 'react';
import { color, font, providerRow } from '@/lib/tokens';
import { t } from '@/lib/i18n';
import type { Lang, ProviderType, OnDeviceBackend } from '@/data/db';
import { Screen, PrimaryButton, Eyebrow } from '@/components/ui';
import { validateKey, checkOnDeviceCapability, isSharedAccessEnabled, type OnDeviceCapability } from '@/providers';
import { saveProviderConfig } from '@/data/repo';
import { DEFAULT_MODELS } from '@/providers/types';

type KeyProvider = 'groq' | 'gemini' | 'anthropic' | 'openai';

const META: Record<KeyProvider, { name: string; mark: string; desc: string; free: boolean; keyUrl: string; placeholder: string }> = {
  groq: { name: 'Groq', mark: 'G', desc: 'Fast · generous free limits', free: true, keyUrl: 'https://console.groq.com/keys', placeholder: 'gsk_…' },
  gemini: { name: 'Gemini', mark: 'G', desc: 'Google · free for everyday use', free: true, keyUrl: 'https://aistudio.google.com/apikey', placeholder: 'AIza…' },
  anthropic: { name: 'Anthropic', mark: 'A', desc: 'Claude · needs an API key', free: false, keyUrl: 'https://console.anthropic.com/settings/keys', placeholder: 'sk-ant-…' },
  openai: { name: 'OpenAI', mark: 'O', desc: 'GPT models · needs an API key', free: false, keyUrl: 'https://platform.openai.com/api-keys', placeholder: 'sk-…' },
};

export default function ProviderScreen({
  lang,
  onDone,
  onWhy,
}: {
  lang: Lang;
  onDone: () => void;
  onWhy: () => void;
}) {
  const s = t(lang);
  const [cap, setCap] = useState<OnDeviceCapability | null>(null);
  const [shared, setShared] = useState(false);
  const [selected, setSelected] = useState<KeyProvider | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [endpoint, setEndpoint] = useState('http://localhost:1234/v1');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    checkOnDeviceCapability().then(setCap);
    isSharedAccessEnabled().then(setShared);
  }, []);

  useEffect(() => {
    setStatus('idle');
    setErrorMsg('');
  }, [selected, apiKey]);

  const onDeviceBackend: OnDeviceBackend = cap?.promptApi ? 'prompt-api' : 'custom-openai';

  async function startFree() {
    setBusy(true);
    await saveProviderConfig({
      type: 'ondevice',
      model: DEFAULT_MODELS.ondevice,
      onDeviceBackend,
      endpoint: onDeviceBackend === 'custom-openai' ? endpoint.trim() : undefined,
    });
    onDone();
  }

  async function useShared() {
    setBusy(true);
    await saveProviderConfig({ type: 'shared', model: DEFAULT_MODELS.shared });
    onDone();
  }

  async function verifyAndSave(p: KeyProvider) {
    setStatus('verifying');
    try {
      await validateKey(p, apiKey.trim());
      await saveProviderConfig({ type: p as ProviderType, model: DEFAULT_MODELS[p], apiKey: apiKey.trim() });
      onDone();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'That didn’t work.');
    }
  }

  return (
    <Screen>
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Eyebrow>{s.howShouldThink}</Eyebrow>
          <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.15, fontWeight: 700, color: color.ink }}>{s.startFreeTitle}</h2>
        </div>

        {/* Recommended: on-device, free, nothing leaves the phone */}
        <div
          style={{
            background: color.card,
            border: `2px solid ${color.sageBorder}`,
            borderRadius: 20,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 11,
            boxShadow: '0 14px 30px -20px rgba(95,125,90,.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: color.sageDeep }}>
              {s.easiestRecommended}
            </span>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: color.sageBgSofter, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 13, height: 13, borderRadius: '50%', border: `2.5px solid ${color.sage}` }} />
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: color.inkSerif, lineHeight: 1.2 }}>{s.tryFreeOnDevice}</div>
          <p style={{ margin: 0, fontSize: 13.5, color: color.muted, lineHeight: 1.45 }}>
            {s.tryFreeBody}
            <span style={{ color: color.honeyMute, fontWeight: 600 }}>{s.tryFreeBodyEmphasis}</span>
          </p>
          {onDeviceBackend === 'custom-openai' && !cap?.promptApi && (
            <input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://localhost:1234/v1"
              spellCheck={false}
              style={{ border: `1px solid ${color.line}`, background: color.cream, borderRadius: 11, padding: '11px 13px', fontFamily: 'monospace', fontSize: 13, outline: 'none' }}
            />
          )}
          <PrimaryButton onClick={startFree} disabled={busy} style={{ padding: 14, fontSize: 15.5, marginTop: 2 }}>
            {s.startFree}
          </PrimaryButton>
        </div>

        {/* Free-tier keys */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 650 as unknown as number, color: '#7A7263' }}>{s.orUseFreeKey}</span>
          <ProviderCard p="groq" lang={lang} selected={selected === 'groq'} onSelect={() => setSelected('groq')} />
          <ProviderCard p="gemini" lang={lang} selected={selected === 'gemini'} onSelect={() => setSelected('gemini')} />
        </div>

        {/* Bring your own (advanced) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Eyebrow>{s.bringOwnKey}</Eyebrow>
          <ProviderCard p="anthropic" lang={lang} selected={selected === 'anthropic'} onSelect={() => setSelected('anthropic')} />
          <ProviderCard p="openai" lang={lang} selected={selected === 'openai'} onSelect={() => setSelected('openai')} />
        </div>

        {/* Key entry panel for the chosen provider */}
        {selected && (
          <div
            className="tripti-expand"
            style={{ display: 'flex', flexDirection: 'column', gap: 8, background: color.card, border: `1px solid ${color.line}`, borderRadius: 16, padding: 14 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 650 as unknown as number, color: '#7A7263' }}>{s.pasteKey}</span>
              <a href={META[selected].keyUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 650 as unknown as number, color: color.sage, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {s.getAKey}
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={META[selected].placeholder}
              autoComplete="off"
              spellCheck={false}
              style={{ border: 'none', background: color.cream, borderRadius: 11, padding: '12px 13px', fontFamily: 'monospace', fontSize: 14, color: color.textBody, outline: 'none' }}
            />
            {status === 'error' && <span style={{ fontSize: 12.5, color: color.clayText }}>{errorMsg}</span>}
            <PrimaryButton onClick={() => verifyAndSave(selected)} disabled={!apiKey.trim() || status === 'verifying'} style={{ padding: 14, fontSize: 15.5 }}>
              {status === 'verifying' ? s.verifying : s.verify}
            </PrimaryButton>
          </div>
        )}

        {/* Operator-gated shared access — only when the operator has enabled it */}
        {shared && (
          <div className="tripti-tap" onClick={useShared} role="button" tabIndex={0} style={{ ...providerRow(false), border: `1.5px dashed #D3C9B6` }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#ECE7DE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.faint, fontSize: 15, flexShrink: 0 }}>⋯</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 650 as unknown as number, color: '#7A7263' }}>{s.sharedTestAccess}</div>
              <div style={{ fontSize: 12, color: color.faint }}>{s.sharedTestDesc}</div>
            </div>
            <span style={{ fontSize: 18, color: color.faint }}>›</span>
          </div>
        )}

        <p style={{ margin: 0, fontSize: 12.5, color: color.muted3, lineHeight: 1.4, textAlign: 'center' }}>{s.whateverPick}</p>
        <span className="tripti-tap" onClick={onWhy} style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: color.sage, cursor: 'pointer' }}>
          {s.whyByoLink}
        </span>
      </div>
    </Screen>
  );
}

function ProviderCard({
  p,
  lang,
  selected,
  onSelect,
}: {
  p: KeyProvider;
  lang: Lang;
  selected: boolean;
  onSelect: () => void;
}) {
  const s = t(lang);
  const m = META[p];
  const desc = p === 'groq' ? s.groqDesc : p === 'gemini' ? s.geminiDesc : m.desc;
  return (
    <div className="tripti-tap" onClick={onSelect} role="button" tabIndex={0} style={providerRow(selected)}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: color.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.serif, fontSize: 18, color: color.textBody, flexShrink: 0 }}>
        {m.mark}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 15, fontWeight: 650 as unknown as number, color: color.ink }}>{m.name}</span>
          {m.free && (
            <span style={{ fontSize: 10, fontWeight: 700, color: color.sageDeep, background: color.sageBgSoft, padding: '2px 7px', borderRadius: 6 }}>{s.freeTier}</span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: color.muted2 }}>{desc}</div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 650 as unknown as number, color: color.sage, whiteSpace: 'nowrap' }}>{s.getAKey}</span>
    </div>
  );
}
