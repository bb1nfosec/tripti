import { color } from '@/lib/tokens';

// The Tripti mark from the logo handoff: a sage cradle/bowl arc beneath a clay
// dot — a fed, content, rising-warmth feeling. Inline SVG (no external file,
// CSP-clean) so it can be tinted and sized inline.

export function TriptiMark({
  size = 56,
  arc = color.sage,
  dot = color.clay,
}: {
  size?: number;
  arc?: string;
  dot?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="202 283 620 620"
      role="img"
      aria-label="Tripti"
      style={{ display: 'block' }}
    >
      <path
        d="M307 573 A205 205 0 0 1 717 573"
        fill="none"
        stroke={arc}
        strokeWidth={74}
        strokeLinecap="round"
      />
      <circle cx={512} cy={458} r={87} fill={dot} />
    </svg>
  );
}

// Mark + Newsreader wordmark, used on the entry screen.
export function TriptiLockup({ markSize = 40 }: { markSize?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <TriptiMark size={markSize} />
      <span
        style={{
          fontFamily: color ? "'Newsreader', Georgia, serif" : 'serif',
          fontSize: markSize * 1.35,
          fontWeight: 500,
          color: color.inkSerif,
          lineHeight: 1,
        }}
      >
        Tripti
      </span>
    </div>
  );
}
