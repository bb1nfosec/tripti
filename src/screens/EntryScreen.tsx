'use client';

import { color, font, langRow, radioDot } from '@/lib/tokens';
import { t, LANG_LABELS } from '@/lib/i18n';
import type { Lang } from '@/data/db';
import { Screen, PrimaryButton } from '@/components/ui';
import { TriptiMark } from '@/components/Logo';

export default function EntryScreen({
  lang,
  onLang,
  onBegin,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  onBegin: () => void;
}) {
  const s = t(lang);
  const order: Lang[] = ['en', 'hinglish', 'regional'];

  return (
    <Screen>
      <div className="tripti-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            textAlign: 'center',
            paddingTop: 24,
          }}
        >
          <TriptiMark size={64} />
          <span style={{ fontFamily: font.deva, fontSize: 18, color: color.faint, marginTop: 4 }}>तृप्ति</span>
          <div style={{ fontFamily: font.serif, fontSize: 52, fontWeight: 500, color: color.inkSerif, lineHeight: 1 }}>
            Tripti
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 16, lineHeight: 1.55, color: color.muted, maxWidth: 300 }}>
            {s.entryBlurb}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 650 as unknown as number, color: '#7A7263', textAlign: 'center' }}>
            {s.chooseLanguage}
          </span>
          {order.map((k) => {
            const info = LANG_LABELS[k];
            const active = lang === k;
            return (
              <div key={k} className="tripti-tap" onClick={() => onLang(k)} role="button" tabIndex={0} style={langRow(active)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 16.5, fontWeight: 650 as unknown as number, color: color.ink }}>{info.label}</span>
                  <span style={{ fontSize: 13, color: color.muted2 }}>{info.sub}</span>
                </div>
                <div style={radioDot(active)} />
              </div>
            );
          })}
          <span style={{ textAlign: 'center', fontSize: 12.5, color: color.muted3, marginTop: 2 }}>
            {s.langSwitchNote}
          </span>
        </div>

        <div style={{ padding: '18px 0 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryButton onClick={onBegin}>{s.begin}</PrimaryButton>
          <span style={{ textAlign: 'center', fontSize: 12.5, color: color.muted3 }}>{s.runsOnDevice}</span>
        </div>
      </div>
    </Screen>
  );
}
