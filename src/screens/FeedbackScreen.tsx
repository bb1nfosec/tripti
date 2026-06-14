'use client';

import { useState } from 'react';
import { color, font, fb } from '@/lib/tokens';
import { t } from '@/lib/i18n';
import type { Lang } from '@/data/db';
import type { Suggestion } from '@/llm/schema';
import { Screen, Eyebrow, Chip, DishPlaceholder } from '@/components/ui';
import { recordFeedback } from '@/data/repo';

type Verdict = 'yes' | 'almost' | 'no';

const REASONS = [
  ['effort', 'Too much effort'],
  ['missing', 'Missing an ingredient'],
  ['mood', 'Not in the mood'],
  ['suit', "Won't suit everyone"],
] as const;

export default function FeedbackScreen({
  lang,
  suggestion,
  onDone,
}: {
  lang: Lang;
  suggestion: Suggestion;
  onDone: () => void;
}) {
  const s = t(lang);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  const showConfirm = verdict === 'yes' || verdict === 'no' || (verdict === 'almost' && !!reason);
  const confirmText =
    verdict === 'yes'
      ? 'Lovely — glad it fit. I’ll keep what worked in mind.'
      : verdict === 'no'
        ? 'No worries — I’ll steer clear of this kind of meal tonight.'
        : 'Got it. I’ll remember that for next time.';

  async function choose(v: Verdict) {
    setVerdict(v);
    setReason(null);
    if (v !== 'almost') {
      // Yes → MealHistory; No → RejectionMemory. Real mutation, immediately.
      await recordFeedback(v, suggestion);
      window.setTimeout(onDone, 1100);
    }
  }

  async function pickReason(key: string, label: string) {
    setReason(key);
    await recordFeedback('almost', suggestion, label); // Almost → one clarifying note
    window.setTimeout(onDone, 1200);
  }

  return (
    <Screen>
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: color.card, border: `1px solid ${color.line}`, borderRadius: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
            <DishPlaceholder height={44} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 550 as unknown as number, color: color.inkSerif, lineHeight: 1.1 }}>{suggestion.meal}</div>
            <div style={{ fontSize: 13, color: color.muted2 }}>{s.tonightsIdea}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.15, fontWeight: 700, color: color.ink }}>{s.howWasIdea}</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: color.muted }}>{s.oneTap}</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div className="tripti-tap" onClick={() => choose('yes')} style={fb(verdict === 'yes')}>{s.yes}</div>
          <div className="tripti-tap" onClick={() => choose('almost')} style={fb(verdict === 'almost')}>{s.almost}</div>
          <div className="tripti-tap" onClick={() => choose('no')} style={fb(verdict === 'no')}>{s.no}</div>
        </div>

        {verdict === 'almost' && (
          <div className="tripti-expand" style={{ display: 'flex', flexDirection: 'column', gap: 12, background: color.card, border: `1px solid ${color.line}`, borderRadius: 18, padding: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 650 as unknown as number, color: color.ink2 }}>{s.whatWouldMakeRight}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {REASONS.map(([k, label]) => (
                <Chip key={k} label={label} selected={reason === k} onClick={() => pickReason(k, label)} />
              ))}
            </div>
          </div>
        )}

        {showConfirm && (
          <div className="tripti-rise" style={{ display: 'flex', alignItems: 'center', gap: 12, background: color.sageBgSofter, borderRadius: 16, padding: '15px 16px' }}>
            <span style={{ width: 27, height: 27, borderRadius: '50%', background: color.sage, color: '#F6F0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 14.5, lineHeight: 1.4, color: '#46513F', fontWeight: 550 as unknown as number }}>{confirmText}</span>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <span style={{ textAlign: 'center', fontSize: 13, color: color.muted3 }}>{s.honestKindest}</span>
      </div>
    </Screen>
  );
}
