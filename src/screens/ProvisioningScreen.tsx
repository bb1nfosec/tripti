'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { color, font } from '@/lib/tokens';
import { pi } from '@/lib/provI18n';
import type { Lang, ProvisioningPlan } from '@/data/db';
import { Screen, Eyebrow, TopBar, LangToggle, PrimaryButton } from '@/components/ui';
import {
  PROVISIONING_CATALOG,
  categorySubtotal,
  planTotal,
  breakdown,
  rupees,
  DEFAULT_QTY,
  DEFAULT_TARGET,
} from '@/data/provisioning';
import { getPlan, nudgeQty } from '@/data/repo';

export default function ProvisioningScreen({
  lang,
  onLang,
  onBack,
  onReview,
  onSourcing,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  onBack: () => void;
  onReview: () => void;
  onSourcing: () => void;
}) {
  const p = pi(lang);
  const plan = useLiveQuery(() => getPlan(), [], {
    id: 1,
    qty: DEFAULT_QTY,
    target: DEFAULT_TARGET,
    acceptedSwaps: [],
    updatedAt: 0,
  } as ProvisioningPlan);

  const qty = plan.qty;
  const total = planTotal(qty);
  const target = plan.target;
  const under = target - total >= 0;
  const pct = Math.min(100, Math.round((total / Math.max(1, target)) * 100));
  const [open, setOpen] = useState<Record<string, boolean>>({ grains: true, dals: true });

  return (
    <Screen>
      <TopBar
        left={<span className="tripti-tap" onClick={onBack} style={{ fontSize: 22, color: color.textBody, cursor: 'pointer' }}>‹</span>}
        center={<LangToggle lang={lang} onChange={onLang} />}
      />
      <div className="tripti-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Eyebrow>Tripti · sourcing</Eyebrow>
          <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 28, lineHeight: 1.08, fontWeight: 500, color: color.inkSerif }}>
            {p.sixMonthPlan}
          </h2>
        </div>

        {/* Budget envelope — live, calm */}
        <div style={{ background: color.card, border: `1px solid ${color.line}`, borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 12.5, color: color.muted2 }}>{p.planTotalLabel}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: color.ink2 }}>
                <span key={total} className="tripti-pop">{rupees(total)}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12.5, color: color.muted2 }}>{p.monthlyTarget}</div>
              <div style={{ fontSize: 16, fontWeight: 650 as unknown as number, color: color.muted3 }}>{rupees(target)}</div>
            </div>
          </div>
          <div style={{ height: 14, borderRadius: 9, background: color.segBg, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color.sage, borderRadius: 9, transition: 'width .3s ease' }} />
          </div>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 7, background: under ? color.sageBgSoft : color.honeyBg, color: under ? color.sageDeep : color.honeyText, padding: '7px 13px', borderRadius: 20, fontSize: 13, fontWeight: 650 as unknown as number }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: under ? color.sageDot : color.honey }} />
            {under ? p.toSpare(rupees(target - total)) : p.over(rupees(total - target))}
          </div>
          <div style={{ fontSize: 13.5, color: color.muted, lineHeight: 1.45 }}>
            {under ? p.comfortablyUnder : p.aLittleOver} — {under ? p.comfortablyUnderSub : p.aLittleOverSub}
          </div>
        </div>

        {/* The plan — collapsible categories with live steppers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PROVISIONING_CATALOG.map((cat) => {
            const isOpen = !!open[cat.id];
            const sub = categorySubtotal(cat, qty);
            return (
              <div key={cat.id} style={{ border: `1px solid ${color.line}`, borderRadius: 18, overflow: 'hidden', background: color.card }}>
                <div
                  className="tripti-tap"
                  onClick={() => setOpen((o) => ({ ...o, [cat.id]: !o[cat.id] }))}
                  role="button"
                  tabIndex={0}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ fontSize: 18, color: color.faint, display: 'inline-block', transition: 'transform .2s ease', transform: isOpen ? 'rotate(90deg)' : 'none', lineHeight: 1 }}>›</span>
                    <div>
                      <div style={{ fontSize: 15.5, fontWeight: 650 as unknown as number, color: color.ink, whiteSpace: 'nowrap' }}>{cat.name}</div>
                      <div style={{ fontSize: 12, color: color.muted3 }}>{cat.items.length} {cat.items.length === 1 ? p.item : p.items}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: color.textBody }}>{rupees(sub)}/mo</div>
                </div>
                <div style={{ overflow: 'hidden', transition: 'max-height .26s ease, opacity .2s ease', maxHeight: isOpen ? 1400 : 0, opacity: isOpen ? 1 : 0 }}>
                  <div style={{ padding: '2px 16px 15px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {cat.items.map((it) => (
                      <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 600, color: color.ink2 }}>{it.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, color: color.muted3 }}>{it.where}</span>
                            <span style={tagStyle(it.tag)}>{it.tag}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
                          <span style={{ fontSize: 14.5, fontWeight: 700, color: color.ink2 }}>{rupees((qty[it.id] ?? 0) * it.rate)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', background: '#F1EDE4', borderRadius: 11, overflow: 'hidden' }}>
                            <div className="tripti-tap" onClick={() => void nudgeQty(it.id, -1)} style={stepBtn}>−</div>
                            <span style={{ minWidth: 50, textAlign: 'center', fontSize: 13, fontWeight: 600, color: color.ink2 }}>
                              {qty[it.id] ?? 0} {it.unit}
                            </span>
                            <div className="tripti-tap" onClick={() => void nudgeQty(it.id, 1)} style={stepBtn}>+</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <span style={{ textAlign: 'center', fontSize: 12.5, color: color.muted3 }}>{p.tapSectionHint}</span>

        {/* Navigation to the review + sourcing screens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 2 }}>
          <PrimaryButton onClick={onReview}>{p.gentleReview} →</PrimaryButton>
          <span className="tripti-tap" onClick={onSourcing} style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: color.sage, cursor: 'pointer' }}>
            {p.whereToBuy} ↗
          </span>
        </div>
        <span style={{ height: 4 }} />
      </div>
    </Screen>
  );
}

const stepBtn = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  color: color.textBody,
  cursor: 'pointer',
  userSelect: 'none' as const,
};

function tagStyle(tag: 'Bulk' | 'Fresh') {
  const fresh = tag === 'Fresh';
  return {
    fontSize: 11,
    fontWeight: 650 as unknown as number,
    padding: '3px 8px',
    borderRadius: 7,
    background: fresh ? color.clayBg : color.sageBgSoft,
    color: fresh ? color.clayText : color.sageDeep,
  };
}
