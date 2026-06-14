'use client';

import { color, font } from '@/lib/tokens';
import { t } from '@/lib/i18n';
import type { Lang } from '@/data/db';
import { Screen, PrimaryButton, TopBar } from '@/components/ui';
import { TriptiMark } from '@/components/Logo';

// "Why bring your own AI?" — a friend explaining a choice, not a legal wall.
export default function WhyScreen({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const s = t(lang);
  const points: { t: string; b: string; honey?: boolean }[] = [
    { t: s.why1t, b: s.why1b },
    { t: s.why2t, b: s.why2b },
    { t: s.why3t, b: s.why3b },
    { t: s.why4t, b: s.why4b, honey: true },
  ];
  return (
    <Screen alt>
      <TopBar left={<span className="tripti-tap" onClick={onBack} style={{ fontSize: 22, color: color.textBody, cursor: 'pointer' }}>‹</span>} />
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TriptiMark size={48} />
          <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 30, lineHeight: 1.12, fontWeight: 500, color: color.inkSerif }}>
            {s.whyByoLink}
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: color.muted, lineHeight: 1.5 }}>{s.whyIntro}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {points.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: p.honey ? '#F3EFE6' : color.sageBgSofter,
                  color: p.honey ? color.honeyMute : color.sageDeep,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 650 as unknown as number, color: color.ink }}>{p.t}</div>
                <div style={{ fontSize: 13.5, color: '#7A7263', lineHeight: 1.45 }}>{p.b}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#F1EDE4', borderRadius: 14, padding: '13px 15px' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#6B5B45', lineHeight: 1.45 }}>{s.whyKeySafe}</p>
        </div>

        <div style={{ flex: 1 }} />
        <PrimaryButton onClick={onBack}>{s.pickHowThinks}</PrimaryButton>
      </div>
    </Screen>
  );
}
