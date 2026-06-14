// Tripti's visual system, lifted from the Claude Design handoff.
// Warm sage-green primary + gentle clay accent on fed-cream neutrals.
// No spice-market orange; confidence reads honest (no reds, no rings).
import type { CSSProperties } from 'react';

export const color = {
  // Surfaces
  body: '#D9D1C2',
  screen: '#F6F0E6',
  screenAlt: '#EFE8DA',
  card: '#FFFDF8',
  cream: '#F6F0E6',
  cream2: '#F1EFE7',
  segBg: '#EFEADF',

  // Sage (primary)
  sage: '#5F7D5A',
  sageDeep: '#45603E',
  sageText: '#46513F',
  sageBgSoft: '#E7EDE2',
  sageBgSofter: '#EAF0E4',
  sageBgSelected: '#EFF3EA',
  sageBorder: '#9DB594',
  sageDot: '#6E8B62',

  // Clay (accent)
  clay: '#C2876A',
  clayText: '#9A5B3E',
  clayBg: '#F4E5DB',
  clayBgWarm: '#F4E9E1',
  clayBorder: '#E7CDBD',

  // Honey (caution / experimental — calm, never alarming)
  honey: '#C7A24E',
  honeyText: '#8A6D2E',
  honeyTextDeep: '#7A5E22',
  honeyMute: '#9A7B3E',
  honeyBg: '#F3E9D2',
  honeyBgSoft: '#F8F2E2',
  honeyBorder: '#E8D6A8',

  // Ink + text
  ink: '#322E28',
  inkSerif: '#2C2820',
  ink2: '#3A352E',
  text: '#4B4339',
  textBody: '#5C5347',
  muted: '#736B5E',
  muted2: '#8A8073',
  muted3: '#9A9082',
  faint: '#A89E88',
  faint2: '#C9C0AE',

  // Lines / borders
  line: '#EDE6D8',
  line2: '#EAE2D4',
  line3: '#E7DFD0',
  lineCard: '#F0E9DB',
} as const;

export const font = {
  sans: "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
  serif: "'Newsreader', Georgia, serif",
  deva: "'Noto Serif Devanagari', serif",
} as const;

// ---- Reusable component styles (mirror the design's helper methods) ----

export function chip(selected: boolean): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '11px 15px',
    borderRadius: 13,
    fontSize: 14.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1.1,
    userSelect: 'none',
    transition: 'background .15s, border-color .15s, color .15s, transform .12s',
    border: '1.5px solid ' + (selected ? color.sageBorder : color.line3),
    background: selected ? color.sageBgSoft : color.card,
    color: selected ? color.sageDeep : color.textBody,
  };
}

export function seg(active: boolean): CSSProperties {
  return {
    flex: 1,
    textAlign: 'center',
    padding: '12px 6px',
    borderRadius: 11,
    fontSize: 14.5,
    fontWeight: 650 as unknown as number,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background .15s, color .15s',
    fontFamily: 'inherit',
    background: active ? color.sage : 'transparent',
    color: active ? '#F8F4EC' : color.textBody,
  };
}

export function fb(active: boolean): CSSProperties {
  return {
    flex: 1,
    textAlign: 'center',
    padding: '17px 8px',
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 650 as unknown as number,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background .15s, border-color .15s, color .15s, transform .12s',
    userSelect: 'none',
    border: '1.5px solid ' + (active ? color.sageBorder : color.line3),
    background: active ? color.sageBgSoft : color.card,
    color: active ? color.sageDeep : color.ink2,
  };
}

export function providerRow(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 13,
    padding: '14px 15px',
    borderRadius: 16,
    cursor: 'pointer',
    transition: 'background .15s, border-color .15s',
    border: '1.5px solid ' + (active ? color.sageBorder : color.line2),
    background: active ? color.sageBgSelected : color.card,
  };
}

export function langRow(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '16px 17px',
    borderRadius: 17,
    cursor: 'pointer',
    transition: 'background .15s, border-color .15s',
    border: '1.5px solid ' + (active ? color.sageBorder : color.line2),
    background: active ? color.sageBgSelected : color.card,
  };
}

export function radioDot(active: boolean): CSSProperties {
  const base: CSSProperties = {
    width: 22,
    height: 22,
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background .15s, border-color .15s, box-shadow .15s',
  };
  return active
    ? { ...base, border: `2px solid ${color.sage}`, background: color.sage, boxShadow: `inset 0 0 0 4px ${color.card}` }
    : { ...base, border: `2px solid #CFC5B2`, background: color.card };
}

export const primaryBtn: CSSProperties = {
  padding: 17,
  borderRadius: 17,
  background: color.sage,
  color: '#F8F4EC',
  textAlign: 'center',
  fontSize: 17,
  fontWeight: 650 as unknown as number,
  boxShadow: '0 10px 20px -10px rgba(95,125,90,.7)',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  fontFamily: 'inherit',
  userSelect: 'none',
  transition: 'transform .12s, filter .15s',
};

export const eyebrow: CSSProperties = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: '.13em',
  textTransform: 'uppercase',
  color: color.faint,
};

// Confidence → palette mapping (honest, never red).
export function confidenceStyle(level: 'high' | 'medium' | 'low') {
  if (level === 'high') return { bg: color.sageBgSoft, text: color.sageDeep, dot: color.sageDot, label: 'High' };
  if (level === 'medium') return { bg: color.honeyBg, text: color.honeyText, dot: color.honey, label: 'Medium' };
  return { bg: color.clayBg, text: color.clayText, dot: color.clay, label: 'Low' };
}
