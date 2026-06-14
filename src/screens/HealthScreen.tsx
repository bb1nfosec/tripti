'use client';

import { useEffect, useRef, useState } from 'react';
import { color, font } from '@/lib/tokens';
import { pi } from '@/lib/provI18n';
import type { Lang, HealthReviewRecord } from '@/data/db';
import { Screen, Eyebrow, TopBar, LangToggle, PrimaryButton } from '@/components/ui';
import { makeProvider, ProviderError } from '@/providers';
import { getHealthReview } from '@/llm/health';
import { ParseError } from '@/llm/parse';
import type { HealthReview } from '@/llm/schema';
import { getProviderConfig, getHousehold, getPlan, acceptSwap, saveHealthReview, getLastHealthReview } from '@/data/repo';

type View = 'intro' | 'thinking' | 'ready' | 'failed' | 'fallback' | 'offline';

export default function HealthScreen({
  lang,
  onLang,
  onBack,
  onCheckKey,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  onBack: () => void;
  onCheckKey: () => void;
}) {
  const p = pi(lang);
  const [view, setView] = useState<View>('intro');
  const [review, setReview] = useState<HealthReview | null>(null);
  const [last, setLast] = useState<HealthReviewRecord | null>(null);
  const [swapState, setSwapState] = useState<Record<number, 'pending' | 'accepted' | 'dismissed'>>({});
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getLastHealthReview().then((r) => setLast(r ?? null));
  }, []);

  async function run() {
    if (!navigator.onLine) {
      setView('offline');
      return;
    }
    const cfg = await getProviderConfig();
    if (!cfg) {
      setView('failed');
      return;
    }
    setView('thinking');
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const [household, plan] = await Promise.all([getHousehold(), getPlan()]);
      const result = await getHealthReview({ provider: makeProvider(cfg), household, qty: plan.qty, lang, signal: ac.signal });
      if (ac.signal.aborted) return;
      setReview(result);
      setSwapState(Object.fromEntries(result.swaps.map((_, i) => [i, 'pending'])));
      setView('ready');
      await saveHealthReview(result.swaps, result.note);
      setLast({ id: 1, swaps: result.swaps, note: result.note, updatedAt: Date.now() });
    } catch (err) {
      if (ac.signal.aborted) return;
      if (err instanceof ParseError) {
        const fav = await getLastHealthReview();
        setLast(fav ?? null);
        setView('fallback');
      } else if (err instanceof ProviderError) {
        setView('failed');
      } else {
        setView('failed');
      }
    }
  }

  return (
    <Screen alt={view === 'ready' || view === 'thinking' || view === 'fallback' || view === 'intro'}>
      <TopBar
        left={<span className="tripti-tap" onClick={onBack} style={{ fontSize: 22, color: color.textBody, cursor: 'pointer' }}>‹</span>}
        center={<LangToggle lang={lang} onChange={onLang} />}
      />
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 15, flex: 1 }}>
        <Header lang={lang} />

        {view !== 'failed' && view !== 'offline' && (
          <div style={{ background: '#F1EDE4', border: '1px solid #E6DBCB', borderRadius: 16, padding: '14px 15px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: '#E3D6C4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9A7B5A', fontWeight: 700 }}>+</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 650 as unknown as number, color: '#6B5B45' }}>{p.doctorSetsNumbers}</div>
              <div style={{ fontSize: 13, color: '#8A7A64', lineHeight: 1.4 }}>{p.doctorSub}</div>
            </div>
          </div>
        )}

        {view === 'intro' && (
          <>
            {last && <LastReviewPreview last={last} lang={lang} muted />}
            <div style={{ flex: 1 }} />
            <PrimaryButton onClick={() => void run()}>{p.runReview}</PrimaryButton>
          </>
        )}

        {view === 'thinking' && <Thinking lang={lang} />}

        {view === 'ready' && review && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {review.swaps.map((sw, i) => {
                const st = swapState[i] ?? 'pending';
                if (st === 'dismissed') return null;
                const accepted = st === 'accepted';
                return (
                  <div key={i} style={{ background: accepted ? color.sageBgSofter : color.card, border: `1px solid ${accepted ? '#CBD9C2' : color.line}`, borderRadius: 16, padding: 15, transition: 'background .2s, border-color .2s' }}>
                    <div style={{ fontSize: 15, fontWeight: 650 as unknown as number, color: color.ink, lineHeight: 1.25 }}>{sw.title}</div>
                    <div style={{ fontSize: 13.5, color: '#7A7263', lineHeight: 1.4, marginTop: 5 }}>{sw.sub}</div>
                    {st === 'pending' ? (
                      <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
                        <div
                          className="tripti-tap"
                          onClick={async () => {
                            await acceptSwap(sw.title);
                            setSwapState((s) => ({ ...s, [i]: 'accepted' }));
                          }}
                          style={{ flex: 1, textAlign: 'center', padding: 11, borderRadius: 12, background: color.sage, color: '#F8F4EC', fontSize: 14, fontWeight: 650 as unknown as number, cursor: 'pointer' }}
                        >
                          {p.addToPlan}
                        </div>
                        <div
                          className="tripti-tap"
                          onClick={() => setSwapState((s) => ({ ...s, [i]: 'dismissed' }))}
                          style={{ padding: '11px 16px', borderRadius: 12, background: color.card, border: `1.5px solid ${color.line3}`, color: '#7A7263', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                        >
                          {p.notNow}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11, color: color.sageDeep, fontSize: 13.5, fontWeight: 650 as unknown as number }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: color.sage, color: '#F6F0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
                        {p.addedToPlan}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span style={{ textAlign: 'center', fontSize: 12.5, color: color.muted3 }}>{p.takeWhatHelps}</span>
          </>
        )}

        {view === 'fallback' && (
          <>
            <div style={{ background: color.honeyBg, border: `1px solid ${color.honeyBorder}`, borderRadius: 16, padding: '13px 15px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: color.honey, marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 650 as unknown as number, color: color.honeyTextDeep }}>{p.lastGoodReview}</div>
                <div style={{ fontSize: 13, color: '#8A7340', lineHeight: 1.4 }}>{p.lastGoodSub}</div>
              </div>
            </div>
            {last ? <LastReviewPreview last={last} lang={lang} /> : <Empty lang={lang} />}
            <div style={{ flex: 1 }} />
            <span style={{ textAlign: 'center', fontSize: 13, color: color.muted3 }}>{p.freshReviewSoon}</span>
          </>
        )}

        {view === 'failed' && (
          <>
            <div style={{ background: '#F4E9E1', border: `1px solid ${color.clayBorder}`, borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EBD6C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #B97A55' }} />
              </div>
              <div style={{ fontSize: 19, fontWeight: 700, color: color.ink2, lineHeight: 1.2, marginTop: 2 }}>{p.couldntRunReview}</div>
              <p style={{ margin: 0, fontSize: 14.5, color: '#6B5B50', lineHeight: 1.45 }}>{p.couldntRunSub}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PrimaryButton onClick={() => void run()}>{p.tryReviewAgain} ↻</PrimaryButton>
              <div className="tripti-tap" onClick={onCheckKey} style={{ padding: '16px 17px', borderRadius: 16, background: color.card, border: `1px solid ${color.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: 15.5, fontWeight: 600, color: color.ink2 }}>Check your provider</span>
                <span style={{ fontSize: 18, color: color.faint }}>›</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: color.segBg, borderRadius: 14, padding: '13px 15px' }}>
              <span style={{ color: color.sage, fontWeight: 700, fontSize: 15, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13.5, color: color.textBody, lineHeight: 1.4 }}>{p.planBudgetSafe}</span>
            </div>
          </>
        )}

        {view === 'offline' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ECE7DE', borderRadius: 13, padding: '12px 15px' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: color.faint, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: color.textBody }}>You’re offline — your plan still works</span>
            </div>
            <div style={{ background: '#F1EDE4', border: '1px dashed #D3C9B6', borderRadius: 18, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15.5, fontWeight: 650 as unknown as number, color: color.muted3 }}>{p.aGentleLook}</span>
              <span style={{ fontSize: 11.5, fontWeight: 650 as unknown as number, color: color.faint, background: '#E7E0D4', padding: '4px 9px', borderRadius: 8, whiteSpace: 'nowrap' }}>{p.reviewNeedsProvider}</span>
            </div>
            {last && <LastReviewPreview last={last} lang={lang} />}
            <div style={{ flex: 1 }} />
            <PrimaryButton onClick={onBack}>Back to the plan</PrimaryButton>
          </>
        )}
      </div>
    </Screen>
  );

  function Empty({ lang }: { lang: Lang }) {
    void lang;
    return (
      <div style={{ background: color.card, border: `1px dashed ${color.line2}`, borderRadius: 16, padding: 20, textAlign: 'center', color: color.muted2, fontSize: 14, lineHeight: 1.5 }}>
        {pi(lang).freshReviewSoon}
      </div>
    );
  }
}

function Header({ lang }: { lang: Lang }) {
  const p = pi(lang);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Eyebrow>{p.aGentleLook}</Eyebrow>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color.sageBgSoft, color: color.sageDeep, fontSize: 11.5, fontWeight: 650 as unknown as number, padding: '4px 9px', borderRadius: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color.sageDot }} />
          {p.onDevicePrivately}
        </span>
      </div>
      <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 26, lineHeight: 1.1, fontWeight: 500, color: color.inkSerif }}>{p.fewKindAdjustments}</h2>
    </div>
  );
}

function LastReviewPreview({ last, lang, muted }: { last: HealthReviewRecord; lang: Lang; muted?: boolean }) {
  const p = pi(lang);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: muted ? 0.92 : 1 }}>
      {last.swaps.map((sw, i) => (
        <div key={i} style={{ background: color.card, border: `1px solid ${color.lineCard}`, borderRadius: 16, padding: 15, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 650 as unknown as number, color: color.ink }}>{sw.title}</div>
          <div style={{ fontSize: 13.5, color: '#7A7263', lineHeight: 1.4 }}>{sw.sub}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: color.sageDeep, fontSize: 13, fontWeight: 650 as unknown as number, marginTop: 3 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: color.sage, color: '#F6F0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</span>
            {p.alreadyInPlan}
          </div>
        </div>
      ))}
    </div>
  );
}

function Thinking({ lang }: { lang: Lang }) {
  const p = pi(lang);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => i + 1), 1900);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      <div className="tripti-pulse" style={{ height: 62, borderRadius: 14, background: '#E3D6C4' }} />
      {[0, 1].map((k) => (
        <div key={k} style={{ background: color.card, border: `1px solid ${color.lineCard}`, borderRadius: 16, padding: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="tripti-pulse" style={{ width: k ? '64%' : '78%', height: 18, borderRadius: 7, background: '#E8E0CF' }} />
          <div className="tripti-pulse" style={{ width: k ? '48%' : '55%', height: 13, borderRadius: 6, background: '#ECE4D4' }} />
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, justifyContent: 'center', padding: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 0.2, 0.4].map((d) => (
            <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: color.sage, animation: `triptiDot 1.2s ease-in-out ${d}s infinite` }} />
          ))}
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: color.textBody }}>{p.reviewThinking[idx % p.reviewThinking.length]}</span>
      </div>
    </div>
  );
}
