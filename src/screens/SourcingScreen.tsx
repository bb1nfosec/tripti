'use client';

import { color } from '@/lib/tokens';
import { pi } from '@/lib/provI18n';
import type { Lang } from '@/data/db';
import { Screen, Eyebrow, TopBar, LangToggle } from '@/components/ui';

const SOURCES = [
  { name: 'Wholesale belt · APMC', dist: '6 km', pin: color.sage, tags: ['Grains', 'Dals', 'Spices'], badge: 'Bulk · monthly run', badgeBg: color.sageBgSoft, badgeColor: color.sageDeep },
  { name: 'Saturday farmers’ market', dist: '2 km', pin: color.clay, tags: ['Greens', 'Veg'], badge: 'Fresh · weekend', badgeBg: color.clayBg, badgeColor: color.clayText },
  { name: 'Millet & native store', dist: '3 km', pin: color.honey, tags: ['Millets', 'Cold-pressed oil'], badge: 'The healthy swaps', badgeBg: color.sageBgSoft, badgeColor: color.sageDeep },
];

const TIPS = [
  'Dals in airtight steel — the monsoon’s unkind to them.',
  'Buy millet flour small; it turns faster than wheat.',
  'Keep jaggery off damp shelves — a dry dabba is best.',
];

const teardrop = (c: string): React.CSSProperties => ({
  width: 13,
  height: 13,
  borderRadius: '50% 50% 50% 0',
  background: c,
  transform: 'rotate(-45deg)',
  display: 'inline-block',
});

export default function SourcingScreen({ lang, onLang, onBack }: { lang: Lang; onLang: (l: Lang) => void; onBack: () => void }) {
  const p = pi(lang);
  return (
    <Screen>
      <TopBar
        left={<span className="tripti-tap" onClick={onBack} style={{ fontSize: 22, color: color.textBody, cursor: 'pointer' }}>‹</span>}
        center={<LangToggle lang={lang} onChange={onLang} />}
      />
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Eyebrow>{p.aroundYou}</Eyebrow>
          <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.15, fontWeight: 700, color: color.ink }}>{p.whereToBuyWhat}</h2>
        </div>

        {/* Soft neighbourhood map placeholder with source pins */}
        <div style={{ height: 128, borderRadius: 18, position: 'relative', overflow: 'hidden', background: '#E7E7DC' }}>
          <div style={{ position: 'absolute', left: '-10%', top: '38%', width: '120%', height: 11, background: '#DCD8C8', transform: 'rotate(-7deg)' }} />
          <div style={{ position: 'absolute', left: '24%', top: '-20%', width: 11, height: '140%', background: '#DCD8C8', transform: 'rotate(9deg)' }} />
          <span style={{ position: 'absolute', left: '18%', top: '30%' }}>{pin(color.sage)}</span>
          <span style={{ position: 'absolute', left: '54%', top: '50%' }}>{pin(color.clay)}</span>
          <span style={{ position: 'absolute', left: '72%', top: '24%' }}>{pin(color.honey)}</span>
          <span style={{ position: 'absolute', left: 12, bottom: 10, fontFamily: 'monospace', fontSize: 10.5, color: '#9A8F79', background: color.screen, padding: '3px 7px', borderRadius: 6 }}>
            {p.yourNeighbourhood}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SOURCES.map((src) => (
            <div key={src.name} style={{ background: color.card, border: `1px solid ${color.line}`, borderRadius: 16, padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={teardrop(src.pin)} />
                  <span style={{ fontSize: 15, fontWeight: 650 as unknown as number, color: color.ink }}>{src.name}</span>
                </div>
                <span style={{ fontSize: 12.5, color: color.muted2 }}>{src.dist}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {src.tags.map((tg) => (
                  <span key={tg} style={{ fontSize: 11.5, fontWeight: 600, color: color.textBody, background: color.cream2, padding: '3px 9px', borderRadius: 8 }}>{tg}</span>
                ))}
                <span style={{ fontSize: 11, fontWeight: 650 as unknown as number, color: src.badgeColor, background: src.badgeBg, padding: '3px 9px', borderRadius: 8 }}>{src.badge}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#F3EFE6', borderRadius: 16, padding: 15, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#B0925F' }}>{p.keepingItWell}</span>
          {TIPS.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{ color: '#B0925F', marginTop: 1 }}>·</span>
              <span style={{ fontSize: 13.5, color: color.textBody, lineHeight: 1.45 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

function pin(c: string) {
  return <span style={{ width: 15, height: 15, borderRadius: '50% 50% 50% 0', background: c, transform: 'rotate(-45deg)', display: 'inline-block' }} />;
}
