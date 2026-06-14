'use client';

import { useState } from 'react';
import { color } from '@/lib/tokens';
import { t } from '@/lib/i18n';
import { pi } from '@/lib/provI18n';
import type { Lang } from '@/data/db';
import { Screen, PrimaryButton, Eyebrow, Chip, Segmented, LangToggle } from '@/components/ui';
import type { DailyContext } from '@/prompt/builder';
import { sanitizeForPrompt } from '@/lib/sanitize';

const BASE_INGREDIENTS = [
  'Tomatoes',
  'Onions',
  'Palak',
  'Toor dal',
  'Rice',
  'Garlic',
  'Paneer',
  'Curd',
  'Potato',
  'Lemon',
];

const CONSTRAINTS = [
  ['tight-budget', 'Tight budget'],
  ['quick-only', 'Quick only'],
  ['guest-coming', 'Guest coming'],
  ['tiffin-needed', 'Tiffin needed'],
] as const;

export default function DailyScreen({
  lang,
  onLang,
  onSuggest,
  onHistory,
  onProvisioning,
  today,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  onSuggest: (ctx: DailyContext) => void;
  onHistory: () => void;
  onProvisioning: () => void;
  today: string;
}) {
  const s = t(lang);
  const [sel, setSel] = useState<Record<string, boolean>>({
    Tomatoes: true,
    Onions: true,
    Palak: true,
    'Toor dal': true,
    Rice: true,
    Garlic: true,
  });
  const [custom, setCustom] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [cook, setCook] = useState<'you' | 'aai'>('aai');
  const [energy, setEnergy] = useState<'low' | 'okay' | 'up'>('low');
  const [con, setCon] = useState<Record<string, boolean>>({ 'tight-budget': true, 'quick-only': true });

  const toggle = (k: string) => setSel((p) => ({ ...p, [k]: !p[k] }));
  const toggleCon = (k: string) => setCon((p) => ({ ...p, [k]: !p[k] }));

  function addCustom() {
    const v = sanitizeForPrompt(draft, 40);
    if (v) {
      setCustom((c) => [...c, v]);
      setSel((p) => ({ ...p, [v]: true }));
    }
    setDraft('');
    setAdding(false);
  }

  function submit() {
    const all = [...BASE_INGREDIENTS, ...custom];
    const pantry = all.filter((k) => sel[k]);
    const constraints = CONSTRAINTS.filter(([k]) => con[k]).map(([, label]) => label);
    onSuggest({ pantry, cook: cook === 'you' ? 'You' : 'Aai', energy, constraints });
  }

  return (
    <Screen>
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: color.muted3 }}>{s.greeting}</span>
          <LangToggle lang={lang} onChange={onLang} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Eyebrow>{s.todayLabel(today)}</Eyebrow>
          <h2 style={{ margin: 0, fontSize: 25, lineHeight: 1.15, fontWeight: 700, color: color.ink }}>{s.whatsInKitchen}</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: color.muted }}>{s.tapWhatYouGot}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {[...BASE_INGREDIENTS, ...custom].map((k) => (
            <Chip key={k} label={k} selected={!!sel[k]} onClick={() => toggle(k)} />
          ))}
          {adding ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={addCustom}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              placeholder="Ingredient"
              style={{
                border: `1.5px dashed ${color.sageBorder}`,
                borderRadius: 13,
                padding: '10px 13px',
                fontSize: 14.5,
                outline: 'none',
                background: color.card,
                width: 130,
              }}
            />
          ) : (
            <div
              className="tripti-tap"
              onClick={() => setAdding(true)}
              role="button"
              tabIndex={0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '11px 15px',
                borderRadius: 13,
                fontSize: 14.5,
                fontWeight: 600,
                border: `1.5px dashed ${color.faint}`,
                color: '#7A7263',
                cursor: 'pointer',
              }}
            >
              {s.add}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Eyebrow>{s.tonight}</Eyebrow>
          <Sub label={s.whosCooking}>
            <Segmented
              value={cook}
              onChange={setCook}
              options={[
                { key: 'you', label: 'You' },
                { key: 'aai', label: 'Aai' },
              ]}
            />
          </Sub>
          <Sub label={s.energyTonight}>
            <Segmented
              value={energy}
              onChange={setEnergy}
              options={[
                { key: 'low', label: 'A bit tired' },
                { key: 'okay', label: 'Okay' },
                { key: 'up', label: 'Up for it' },
              ]}
            />
          </Sub>
          <Sub label={s.anythingSpecial}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CONSTRAINTS.map(([k, label]) => (
                <Chip key={k} label={label} selected={!!con[k]} onClick={() => toggleCon(k)} />
              ))}
            </div>
          </Sub>
        </div>

        <PrimaryButton onClick={submit} style={{ marginTop: 2 }}>
          {s.showMeIdea} &nbsp;→
        </PrimaryButton>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: -2, flexWrap: 'wrap' }}>
          <span className="tripti-tap" onClick={onHistory} style={{ fontSize: 13.5, fontWeight: 600, color: color.sage, cursor: 'pointer' }}>
            {s.cookedLoved} ↗
          </span>
          <span className="tripti-tap" onClick={onProvisioning} style={{ fontSize: 13.5, fontWeight: 600, color: color.sage, cursor: 'pointer' }}>
            {pi(lang).sixMonthPlan} ↗
          </span>
        </div>
      </div>
    </Screen>
  );
}

function Sub({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 13.5, fontWeight: 650 as unknown as number, color: '#7A7263' }}>{label}</span>
      {children}
    </div>
  );
}
