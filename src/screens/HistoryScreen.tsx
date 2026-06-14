'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { color, font } from '@/lib/tokens';
import { t } from '@/lib/i18n';
import type { Lang, MealRecord } from '@/data/db';
import { Screen, Eyebrow, TopBar, DishPlaceholder, LangToggle } from '@/components/ui';
import { getMealHistory } from '@/data/repo';

export default function HistoryScreen({
  lang,
  onLang,
  onBack,
  onCookAgain,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  onBack: () => void;
  onCookAgain: (meal: MealRecord) => void;
}) {
  const s = t(lang);
  // Reloads straight from Dexie — zero AI calls. Reactive via useLiveQuery.
  const meals = useLiveQuery(() => getMealHistory(), [], [] as MealRecord[]);
  const loved = meals.filter((m) => m.verdict === 'yes');

  return (
    <Screen>
      <TopBar
        left={<span className="tripti-tap" onClick={onBack} style={{ fontSize: 22, color: color.textBody, cursor: 'pointer' }}>‹</span>}
        center={<LangToggle lang={lang} onChange={onLang} />}
      />
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Eyebrow>{s.regulars}</Eyebrow>
          <h2 style={{ margin: 0, fontSize: 25, lineHeight: 1.15, fontWeight: 700, color: color.ink }}>{s.cookedLoved}</h2>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.45, color: color.muted }}>{s.makeAgain}</p>
        </div>

        {loved.length === 0 ? (
          <div style={{ background: color.card, border: `1px dashed ${color.line2}`, borderRadius: 18, padding: 22, textAlign: 'center', color: color.muted2, fontSize: 14, lineHeight: 1.5 }}>
            {s.emptyHistory}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 13, overflowX: 'auto', padding: '2px 2px 10px', margin: '0 -2px' }}>
            {loved.map((m) => (
              <div key={m.id} style={{ flexShrink: 0, width: 210, background: color.card, border: `1px solid ${color.line}`, borderRadius: 20, overflow: 'hidden' }}>
                <DishPlaceholder height={112} />
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <div>
                    <div style={{ fontFamily: font.serif, fontSize: 19, fontWeight: 550 as unknown as number, color: color.inkSerif, lineHeight: 1.1 }}>{m.meal}</div>
                    <div style={{ fontSize: 12.5, color: color.muted2, marginTop: 3 }}>
                      Cooked {m.timesCooked}× · always a yes
                    </div>
                  </div>
                  <div
                    className="tripti-tap"
                    onClick={() => onCookAgain(m)}
                    role="button"
                    tabIndex={0}
                    style={{ padding: 11, borderRadius: 12, background: color.sageBgSoft, color: '#45603E', textAlign: 'center', fontSize: 14, fontWeight: 650 as unknown as number, cursor: 'pointer' }}
                  >
                    {s.cookItAgain}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: color.sageBgSofter, borderRadius: 14, padding: '13px 15px' }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: color.sage, color: '#F6F0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
          <span style={{ fontSize: 13.5, color: '#46513F', lineHeight: 1.4 }}>{s.everyMealWiser}</span>
        </div>
      </div>
    </Screen>
  );
}
