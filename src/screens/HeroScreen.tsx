'use client';

import { useEffect, useState } from 'react';
import { color, font } from '@/lib/tokens';
import { t } from '@/lib/i18n';
import type { Lang, MealRecord } from '@/data/db';
import type { Suggestion } from '@/llm/schema';
import { Screen, PrimaryButton, TopBar, LangToggle, Eyebrow, DishPlaceholder, Chip } from '@/components/ui';
import HeroCard from '@/components/HeroCard';

export type HeroView = 'thinking' | 'downloading' | 'ready' | 'failed' | 'fallback' | 'offline';

export interface HeroScreenProps {
  lang: Lang;
  onLang: (l: Lang) => void;
  view: HeroView;
  suggestion?: Suggestion | null;
  fallbackMeal?: MealRecord | null;
  downloadProgress?: number; // 0..1, undefined = indeterminate
  onBack: () => void;
  onAnother: () => void;
  onAccept: () => void;
  onRetry: () => void;
  onCheckKey: () => void;
  onUseOnDevice: () => void;
  onCookFallback: () => void;
  onClarify: (answer: string) => void;
  onGoHistory: () => void;
}

export default function HeroScreen(props: HeroScreenProps) {
  const { lang, onLang, view } = props;
  const s = t(lang);

  return (
    <Screen alt={view === 'ready' || view === 'thinking' || view === 'fallback'}>
      <TopBar
        left={
          <span className="tripti-tap" onClick={props.onBack} style={{ fontSize: 22, color: color.textBody, cursor: 'pointer' }}>
            ‹
          </span>
        }
        center={<LangToggle lang={lang} onChange={onLang} />}
        right={
          view === 'ready' ? (
            <span className="tripti-tap" onClick={props.onAnother} style={{ fontSize: 13.5, fontWeight: 600, color: color.sage, cursor: 'pointer' }}>
              ↻ {s.another}
            </span>
          ) : null
        }
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {view === 'thinking' && <Thinking lang={lang} />}
        {view === 'downloading' && <Downloading lang={lang} progress={props.downloadProgress} />}
        {view === 'failed' && <Failed {...props} />}
        {view === 'offline' && <Offline {...props} />}
        {view === 'fallback' && <Fallback {...props} />}
        {view === 'ready' && props.suggestion && (
          <>
            <HeroCard data={props.suggestion} lang={lang} />
            <PrimaryButton onClick={props.onAccept} style={{ marginTop: 14 }}>
              {s.letsMakeThis}
            </PrimaryButton>
          </>
        )}
      </div>
    </Screen>
  );
}

// ---- Thinking: calm shimmer skeleton + cycling contextual line ----
function Thinking({ lang }: { lang: Lang }) {
  const s = t(lang);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => i + 1), 1900);
    return () => clearInterval(id);
  }, []);
  const msg = s.thinking[idx % s.thinking.length];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: color.card, borderRadius: 26, overflow: 'hidden', border: `1px solid ${color.lineCard}` }}>
        <div className="tripti-pulse" style={{ height: 140, background: '#E8E0CF' }} />
        <div style={{ padding: '20px 19px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div className="tripti-pulse" style={{ width: '64%', height: 26, borderRadius: 9, background: '#E8E0CF' }} />
            <div className="tripti-pulse" style={{ width: '42%', height: 14, borderRadius: 7, background: '#ECE4D4' }} />
          </div>
          <div className="tripti-pulse" style={{ height: 72, borderRadius: 14, background: color.sageBgSofter }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="tripti-pulse" style={{ width: 90, height: 30, borderRadius: 9, background: '#E8E0CF' }} />
            <div className="tripti-pulse" style={{ width: 120, height: 24, borderRadius: 20, background: '#ECE4D4' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <div className="tripti-pulse" style={{ width: 74, height: 30, borderRadius: 11, background: color.segBg }} />
            <div className="tripti-pulse" style={{ width: 60, height: 30, borderRadius: 11, background: color.segBg }} />
            <div className="tripti-pulse" style={{ width: 88, height: 30, borderRadius: 11, background: color.segBg }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, justifyContent: 'center', padding: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 0.2, 0.4].map((d) => (
            <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: color.sage, animation: `triptiDot 1.2s ease-in-out ${d}s infinite` }} />
          ))}
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: color.textBody }}>{msg}</span>
      </div>
    </div>
  );
}

// ---- Downloading the on-device cook: calm, one-time, never an error ----
function Downloading({ lang, progress }: { lang: Lang; progress?: number }) {
  const s = t(lang);
  const pct = progress != null ? Math.round(progress * 100) : null;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '18px 0 4px' }}>
        <div style={{ width: 84, height: 84, borderRadius: 24, background: color.sageBgSofter, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="tripti-spin" style={{ width: 30, height: 30, borderRadius: '50%', border: `3px solid ${color.sage}`, borderTopColor: 'transparent' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'center' }}>
        <Eyebrow>{s.oneTimeSetup}</Eyebrow>
        <h2 style={{ margin: 0, fontSize: 23, lineHeight: 1.2, fontWeight: 700, color: color.ink }}>{s.settingUpCook}</h2>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.45, color: color.muted }}>{s.downloadBody}</p>
      </div>
      <div style={{ background: color.card, border: `1px solid ${color.line}`, borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 650 as unknown as number, color: color.ink }}>{s.downloadingModel}</span>
          {pct != null && <span style={{ fontSize: 14, fontWeight: 700, color: color.sage }}>{pct}%</span>}
        </div>
        <div style={{ height: 12, borderRadius: 8, background: color.segBg, overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: pct != null ? `${pct}%` : '40%',
              background: color.sage,
              borderRadius: 8,
              overflow: 'hidden',
              transition: 'width .3s',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)', animation: 'triptiSheen 1.7s linear infinite' }} />
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: color.muted2 }}>{s.downloadMeta}</div>
      </div>
      <div style={{ flex: 1 }} />
      <span style={{ textAlign: 'center', fontSize: 13, color: color.muted3 }}>{s.takeYourTime}</span>
    </div>
  );
}

// ---- Call failed: domestic fix-path, no stack trace ----
function Failed(props: HeroScreenProps) {
  const s = t(props.lang);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ background: '#F4E9E1', border: `1px solid ${color.clayBorder}`, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EBD6C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #B97A55' }} />
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: color.ink2, lineHeight: 1.2, marginTop: 2 }}>{s.couldntReach}</div>
        <p style={{ margin: 0, fontSize: 14.5, color: '#6B5B50', lineHeight: 1.45 }}>{s.couldntReachBody}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryButton onClick={props.onRetry}>{s.tryAgain} ↻</PrimaryButton>
        <FixRow label={s.checkKey} onClick={props.onCheckKey} />
        <FixRow label={s.useOnDevice} onClick={props.onUseOnDevice} experimental={s.experimental} />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: color.segBg, borderRadius: 14, padding: '13px 15px' }}>
        <span style={{ color: color.sage, fontWeight: 700, fontSize: 15, marginTop: 1 }}>✓</span>
        <span style={{ fontSize: 13.5, color: color.textBody, lineHeight: 1.4 }}>{s.meanwhileWorks}</span>
      </div>
    </div>
  );
}

function FixRow({ label, onClick, experimental }: { label: string; onClick: () => void; experimental?: string }) {
  return (
    <div
      className="tripti-tap"
      onClick={onClick}
      role="button"
      tabIndex={0}
      style={{
        padding: '16px 17px',
        borderRadius: 16,
        background: color.card,
        border: `1px solid ${color.line2}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15.5, fontWeight: 600, color: color.ink2 }}>{label}</span>
        {experimental && (
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: color.honeyMute, background: color.honeyBg, padding: '2px 7px', borderRadius: 6 }}>
            {experimental}
          </span>
        )}
      </div>
      <span style={{ fontSize: 18, color: color.faint }}>›</span>
    </div>
  );
}

// ---- Parse fallback: a real already-loved meal (never hardcoded) ----
function Fallback(props: HeroScreenProps) {
  const s = t(props.lang);
  const meal = props.fallbackMeal;

  if (!meal) {
    // Empty history → one calm clarifying question instead of a fake meal.
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: color.honeyBg, border: `1px solid ${color.honeyBorder}`, borderRadius: 16, padding: '13px 15px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: color.honey, marginTop: 5, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 650 as unknown as number, color: color.honeyTextDeep }}>{s.comfortBanner}</div>
            <div style={{ fontSize: 13, color: '#8A7340', lineHeight: 1.4 }}>{s.comfortBannerSub}</div>
          </div>
        </div>
        <div style={{ background: color.card, borderRadius: 20, border: `1px solid ${color.line}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: color.ink }}>{s.whatWouldMakeRight}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Lighter', 'Heartier', 'Quicker', 'Comfort food'].map((opt) => (
              <Chip key={opt} label={opt} selected={false} onClick={() => props.onClarify(opt)} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ textAlign: 'center', fontSize: 13, color: color.muted3 }}>{s.freshIdeaSoon}</span>
      </div>
    );
  }

  const d = meal.suggestion;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: color.honeyBg, border: `1px solid ${color.honeyBorder}`, borderRadius: 16, padding: '13px 15px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color.honey, marginTop: 5, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 650 as unknown as number, color: color.honeyTextDeep }}>{s.comfortBanner}</div>
          <div style={{ fontSize: 13, color: '#8A7340', lineHeight: 1.4 }}>{s.comfortBannerSub}</div>
        </div>
      </div>
      <div style={{ background: color.card, borderRadius: 24, overflow: 'hidden', border: `1px solid ${color.lineCard}` }}>
        <DishPlaceholder height={150}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: color.card, border: `1px solid ${color.honeyBorder}`, color: color.honeyText, fontSize: 12, fontWeight: 650 as unknown as number, padding: '6px 11px', borderRadius: 20 }}>
            Cooked {meal.timesCooked}× · always a yes
          </span>
        </DishPlaceholder>
        <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Eyebrow>{s.fromYourKitchen}</Eyebrow>
            <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 28, lineHeight: 1.08, fontWeight: 500, color: color.inkSerif }}>{d.meal}</h2>
            {d.tagline && <p style={{ margin: 0, fontSize: 14.5, color: color.muted, lineHeight: 1.4 }}>{d.tagline}</p>}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ background: color.sageBgSoft, color: color.sageDeep, fontSize: 13, fontWeight: 600, padding: '7px 11px', borderRadius: 11 }}>{d.costApprox}</span>
          </div>
          <PrimaryButton onClick={props.onCookFallback} style={{ padding: 15, fontSize: 16 }}>
            {s.cookItAgain}
          </PrimaryButton>
          <span style={{ textAlign: 'center', fontSize: 12.5, color: color.muted3 }}>{s.instantNoAI}</span>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <span style={{ textAlign: 'center', fontSize: 13, color: color.muted3 }}>{s.freshIdeaSoon}</span>
    </div>
  );
}

// ---- Offline: only "new suggestion" rests; everything local stays usable ----
function Offline(props: HeroScreenProps) {
  const s = t(props.lang);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ECE7DE', borderRadius: 13, padding: '12px 15px' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color.faint, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: color.textBody }}>{s.offlineKitchenWorks}</span>
      </div>
      <div style={{ background: '#F1EDE4', border: `1px dashed #D3C9B6`, borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15.5, fontWeight: 650 as unknown as number, color: color.muted3 }}>{s.freshIdeaNeedsNet}</span>
          <span style={{ fontSize: 11.5, fontWeight: 650 as unknown as number, color: color.faint, background: '#E7E0D4', padding: '4px 9px', borderRadius: 8, whiteSpace: 'nowrap' }}>
            {s.needsInternet}
          </span>
        </div>
        <span style={{ fontSize: 13, color: color.faint }}>{s.backOnline}</span>
      </div>
      <PrimaryButton onClick={props.onGoHistory}>{s.cookLoved}</PrimaryButton>
    </div>
  );
}
