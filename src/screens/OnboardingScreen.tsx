'use client';

import { useState } from 'react';
import { color } from '@/lib/tokens';
import { t } from '@/lib/i18n';
import type { Lang } from '@/data/db';
import { Screen, PrimaryButton, Eyebrow, Chip, Segmented } from '@/components/ui';
import { saveHousehold, markOnboarded } from '@/data/repo';

const REGIONS = [
  ['maharashtrian', 'Maharashtrian'],
  ['punjabi', 'Punjabi'],
  ['south-indian', 'South Indian'],
  ['bengali', 'Bengali'],
  ['gujarati', 'Gujarati'],
  ['mughlai', 'Mughlai'],
] as const;

const EXCLUSIONS = [
  ['no-onion-garlic', 'No onion-garlic'],
  ['no-egg', 'No egg'],
  ['peanut-allergy', 'Peanut allergy'],
  ['jain', 'Jain'],
] as const;

const ACTIVE = [
  ['someone-unwell', 'Someone unwell'],
  ['little-kids', 'Little kids'],
  ['guest-this-week', 'Guest this week'],
  ['just-us', 'Just us'],
] as const;

export default function OnboardingScreen({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const s = t(lang);
  const [region, setRegion] = useState<string>('maharashtrian');
  const [diet, setDiet] = useState<'veg' | 'egg' | 'nonveg'>('veg');
  const [excl, setExcl] = useState<Record<string, boolean>>({ 'no-onion-garlic': true });
  const [active, setActive] = useState<string>('just-us');
  const [saving, setSaving] = useState(false);

  const toggleExcl = (k: string) => setExcl((p) => ({ ...p, [k]: !p[k] }));

  async function finish(skip: boolean) {
    setSaving(true);
    await saveHousehold({
      members: [],
      region,
      diet,
      exclusions: Object.entries(excl).filter(([, v]) => v).map(([k]) => k),
      houseRules: [],
      budgetBand: 'comfortable',
      pantryDefaults: [],
      activeContext: active,
    });
    await markOnboarded();
    setSaving(false);
    onDone();
    void skip;
  }

  return (
    <Screen>
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#7A7263' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color.sage, animation: 'triptiDot 1.4s ease-in-out infinite' }} />
            {s.about90}
          </span>
          <span className="tripti-tap" onClick={() => finish(true)} style={{ fontSize: 14, fontWeight: 600, color: color.muted3, cursor: 'pointer' }}>
            {s.skip}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Eyebrow>{s.justBasics}</Eyebrow>
          <h2 style={{ margin: 0, fontSize: 25, lineHeight: 1.15, fontWeight: 700, color: color.ink }}>{s.basicsTitle}</h2>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.45, color: color.muted }}>{s.basicsBody}</p>
        </div>

        <Field label={s.cookingFrom}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {REGIONS.map(([k, label]) => (
              <Chip key={k} label={label} selected={region === k} onClick={() => setRegion(k)} />
            ))}
          </div>
        </Field>

        <Field label={s.neverEats}>
          <Segmented
            value={diet}
            onChange={setDiet}
            options={[
              { key: 'veg', label: 'Pure veg' },
              { key: 'egg', label: 'Eggetarian' },
              { key: 'nonveg', label: 'Non-veg' },
            ]}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 9 }}>
            {EXCLUSIONS.map(([k, label]) => (
              <Chip key={k} label={label} selected={!!excl[k]} onClick={() => toggleExcl(k)} />
            ))}
          </div>
        </Field>

        <Field label={s.cookingForSpecial}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ACTIVE.map(([k, label]) => (
              <Chip key={k} label={label} selected={active === k} onClick={() => setActive(k)} />
            ))}
          </div>
        </Field>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 2 }}>
          <PrimaryButton onClick={() => finish(false)} disabled={saving}>
            {s.showFirstIdea}
          </PrimaryButton>
          <span className="tripti-tap" onClick={() => finish(true)} style={{ textAlign: 'center', fontSize: 13, color: color.muted3, cursor: 'pointer' }}>
            {s.skipStart}
          </span>
        </div>
      </div>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <span style={{ fontSize: 13.5, fontWeight: 650 as unknown as number, color: '#7A7263' }}>{label}</span>
      {children}
    </div>
  );
}
