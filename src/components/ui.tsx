'use client';

import type { CSSProperties, ReactNode } from 'react';
import { color, font, primaryBtn, eyebrow, chip as chipStyle, seg as segStyle } from '@/lib/tokens';
import { LANG_LABELS } from '@/lib/i18n';
import type { Lang } from '@/data/db';

// Full-height mobile screen. (The design's phone frame, fake "9:41" status bar,
// and home-indicator pill are device chrome from the presentation board — dropped
// for the real PWA; the screen fills the viewport instead.)
export function Screen({
  children,
  alt = false,
  pad = true,
}: {
  children: ReactNode;
  alt?: boolean;
  pad?: boolean;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        minHeight: '100dvh',
        background: alt ? color.screenAlt : color.screen,
        display: 'flex',
        flexDirection: 'column',
        padding: pad ? '22px 22px calc(22px + env(safe-area-inset-bottom))' : 0,
        fontFamily: font.sans,
        color: color.ink,
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span style={eyebrow}>{children}</span>;
}

export function Serif({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span style={{ fontFamily: font.serif, ...style }}>{children}</span>;
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className="tripti-tap"
      onClick={onClick}
      disabled={disabled}
      style={{ ...primaryBtn, opacity: disabled ? 0.55 : 1, cursor: disabled ? 'default' : 'pointer', ...style }}
    >
      {children}
    </button>
  );
}

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div className="tripti-tap" onClick={onClick} role="button" tabIndex={0} style={chipStyle(selected)}>
      {label}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 4, background: color.segBg, borderRadius: 14, padding: 4 }}>
      {options.map((o) => (
        <div key={o.key} className="tripti-tap" onClick={() => onChange(o.key)} style={segStyle(value === o.key)}>
          {o.label}
        </div>
      ))}
    </div>
  );
}

// The persistent language pill that cycles EN → Hinglish → हिंदी on tap.
export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const order: Lang[] = ['en', 'hinglish', 'regional'];
  const next = () => onChange(order[(order.indexOf(lang) + 1) % order.length]);
  const info = LANG_LABELS[lang];
  return (
    <div
      className="tripti-tap"
      onClick={next}
      role="button"
      tabIndex={0}
      aria-label="Switch language"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: color.segBg,
        borderRadius: 20,
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: 650 as unknown as number,
        color: color.textBody,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span style={{ fontFamily: font.deva }}>{info.deva}</span>
      {info.chip}
      <span style={{ color: color.faint }}>⌄</span>
    </div>
  );
}

export function ConfidenceChip({ level, label }: { level: 'high' | 'medium' | 'low'; label: string }) {
  const c =
    level === 'high'
      ? { bg: color.sageBgSoft, text: color.sageDeep, dot: color.sageDot }
      : level === 'medium'
        ? { bg: color.honeyBg, text: color.honeyText, dot: color.honey }
        : { bg: color.clayBg, text: color.clayText, dot: color.clay };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: c.bg,
        color: c.text,
        fontSize: 12.5,
        fontWeight: 650 as unknown as number,
        padding: '6px 11px',
        borderRadius: 20,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }} />
      {label}
    </span>
  );
}

// Striped placeholder where a real warm food photo belongs.
export function DishPlaceholder({
  height = 148,
  label,
  children,
}: {
  height?: number;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        height,
        position: 'relative',
        background:
          'repeating-linear-gradient(135deg,#ECE4D4,#ECE4D4 11px,#E5DCC9 11px,#E5DCC9 22px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: 14,
      }}
    >
      {label && (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#9A8F79',
            background: color.card,
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: color.card,
        borderRadius: 20,
        border: `1px solid ${color.line}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TopBar({
  left,
  center,
  right,
}: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 2px 6px',
        minHeight: 34,
      }}
    >
      <div style={{ minWidth: 40, display: 'flex', alignItems: 'center' }}>{left}</div>
      <div style={{ flex: 1, textAlign: 'center', fontWeight: 650 as unknown as number, color: color.ink2 }}>
        {center}
      </div>
      <div style={{ minWidth: 40, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>{right}</div>
    </div>
  );
}
