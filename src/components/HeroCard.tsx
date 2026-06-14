'use client';

import { color, font } from '@/lib/tokens';
import { t } from '@/lib/i18n';
import type { Lang } from '@/data/db';
import type { Suggestion } from '@/llm/schema';
import { ConfidenceChip, DishPlaceholder } from '@/components/ui';

// Renders the typed Suggestion exactly as the schema delivers it. Nothing here
// is hardcoded content — every field comes from the live (or reloaded) payload.
export default function HeroCard({ data, lang }: { data: Suggestion; lang: Lang }) {
  const s = t(lang);
  const buyCount = data.ingredients.filter((i) => !i.have).length;
  const costLabel =
    data.costConfidence === 'high' ? s.costHigh : data.costConfidence === 'medium' ? s.costMedium : s.costLow;
  const confLine =
    data.confidence === 'high' ? s.confidentHigh : data.confidence === 'medium' ? s.confidentMedium : s.confidentLow;
  const confDot =
    data.confidence === 'high' ? color.sageDot : data.confidence === 'medium' ? color.honey : color.clay;

  return (
    <div
      className="tripti-rise"
      style={{
        background: color.card,
        borderRadius: 26,
        overflow: 'hidden',
        border: `1px solid ${color.lineCard}`,
        boxShadow: '0 24px 50px -28px rgba(54,44,30,.4), 0 6px 16px -10px rgba(54,44,30,.18)',
      }}
    >
      <DishPlaceholder label={s.dishPhoto}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: color.card,
            border: '1px solid #D7E0CF',
            color: color.sageDeep,
            fontSize: 12.5,
            fontWeight: 650 as unknown as number,
            padding: '6px 11px',
            borderRadius: 20,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: color.sageDot }} />
          {s.fitsYourHouse}
        </span>
      </DishPlaceholder>

      <div style={{ padding: '20px 19px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: color.faint }}>
            {s.tonightsIdea}
          </span>
          <h2 style={{ margin: 0, fontFamily: font.serif, fontSize: 30, lineHeight: 1.08, fontWeight: 500, color: color.inkSerif }}>
            {data.meal}
          </h2>
          {data.tagline && <p style={{ margin: 0, fontSize: 15, color: color.muted, lineHeight: 1.4 }}>{data.tagline}</p>}
        </div>

        <div style={{ background: color.sageBgSofter, borderRadius: 16, padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: color.sage }}>
            {s.whyThisWorks}
          </span>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: '#46513F' }}>{data.why}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 25, fontWeight: 700, color: color.inkSerif }}>{data.costApprox}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <ConfidenceChip level={data.costConfidence} label={costLabel} />
          </div>
        </div>

        <Divider />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: color.ink }}>{s.whatYoullNeed}</span>
            <span style={{ fontSize: 12.5, color: color.muted2 }}>{s.toBuy(buyCount)}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.ingredients.map((ing, i) =>
              ing.have ? (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: color.cream2,
                    color: color.textBody,
                    fontSize: 13.5,
                    fontWeight: 550 as unknown as number,
                    padding: '7px 11px',
                    borderRadius: 11,
                  }}
                >
                  <span style={{ color: color.sage, fontWeight: 700 }}>✓</span>
                  {ing.name}
                </span>
              ) : (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: color.clayBg,
                    color: color.clayText,
                    fontSize: 13.5,
                    fontWeight: 600,
                    padding: '7px 11px',
                    borderRadius: 11,
                    border: `1px solid ${color.clayBorder}`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: color.clay }} />
                  {ing.name}
                </span>
              )
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: color.ink }}>{s.howToMake}</span>
          {data.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: '50%',
                  background: color.sageBgSoft,
                  color: color.sageDeep,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.45, color: color.text }}>{step}</p>
            </div>
          ))}
        </div>

        {data.leftoverIdea && (
          <div style={{ background: '#F3EFE6', borderRadius: 14, padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.11em', textTransform: 'uppercase', color: '#B0925F' }}>
              {s.leftoverIdea}
            </span>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: color.textBody }}>{data.leftoverIdea}</p>
          </div>
        )}

        <Divider />

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: confDot, marginTop: 5, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 650 as unknown as number, color: color.ink2 }}>{confLine}</div>
            {data.confidenceNote && (
              <div style={{ fontSize: 13.5, color: color.muted2, lineHeight: 1.4 }}>{data.confidenceNote}</div>
            )}
          </div>
        </div>

        {data.backupOption && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '13px 14px',
              border: `1px solid ${color.line2}`,
              borderRadius: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: color.faint }}>
                {s.orSimpler}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: color.ink2, marginTop: 2 }}>
                {data.backupOption.meal}
                {data.backupOption.note ? ` · ${data.backupOption.note}` : ''}
              </div>
            </div>
            <span style={{ fontSize: 19, color: color.faint }}>›</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: color.line }} />;
}
