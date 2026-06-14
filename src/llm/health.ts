import type { LLMProvider } from '@/providers';
import type { Household, Lang } from '@/data/db';
import { HealthReviewSchema, HEALTH_SHAPE, type HealthReview } from './schema';
import { ParseError } from './parse';
import { cleanText, sanitizeForPrompt, sanitizeListForPrompt } from '@/lib/sanitize';
import { planSummaryForPrompt } from '@/data/provisioning';

const LANG_LINE: Record<Lang, string> = {
  en: 'Write all text in clear, simple English.',
  hinglish: 'Write all text in warm Hinglish (Latin script).',
  regional: 'Write all text in simple Hindi (Devanagari).',
};

function systemPrompt(lang: Lang): string {
  return [
    'You are Tripti, a warm, knowledgeable friend reviewing a household’s six-month grocery plan.',
    'Offer a few GENTLE, member-aware sourcing swaps (e.g. route some rice to millet for a sugar-conscious member; lean oils to cold-pressed for an asthma-friendly home; a small B12 top-up for vegetarians).',
    'You are NOT a doctor. NEVER give medical targets, portions, dosages, or restrictions — defer those to the family’s own doctor. Tripti only sources around the doctor’s numbers.',
    'Never alarm, never imply the family eats wrong. Each swap is optional.',
    LANG_LINE[lang],
    '',
    'Respond with ONLY one JSON object, no prose/markdown, matching exactly:',
    HEALTH_SHAPE,
  ].join('\n');
}

function userPrompt(household: Household | undefined, planSummary: string): string {
  const lines: string[] = ['Review this household and plan, then suggest gentle swaps.', ''];
  if (household) {
    lines.push(`Diet: ${household.diet}`);
    if (household.exclusions.length) lines.push(`Strict exclusions: ${sanitizeListForPrompt(household.exclusions).join(', ')}`);
    const notes = household.members.flatMap((m) => m.healthNotes).filter(Boolean);
    if (notes.length) lines.push(`Health notes in the home: ${sanitizeListForPrompt(notes).join('; ')}`);
    if (household.activeContext) lines.push(`Right now: ${sanitizeForPrompt(household.activeContext, 40)}`);
  }
  lines.push('');
  lines.push(`Current plan: ${sanitizeForPrompt(planSummary, 1200)}`);
  return lines.join('\n');
}

export function parseHealthReview(raw: string): HealthReview {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = (fenced ? fenced[1] : raw).trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new ParseError('No JSON object in review.');
  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new ParseError('Review was not valid JSON.');
  }
  const result = HealthReviewSchema.safeParse(data);
  if (!result.success) throw new ParseError('Review did not match the expected shape.');
  // XSS-clean every rendered field.
  return {
    note: cleanText(result.data.note, 280),
    swaps: result.data.swaps.map((s) => ({ title: cleanText(s.title, 120), sub: cleanText(s.sub, 220) })),
  };
}

export async function getHealthReview(args: {
  provider: LLMProvider;
  household?: Household;
  qty: Record<string, number>;
  lang: Lang;
  signal?: AbortSignal;
}): Promise<HealthReview> {
  const raw = await args.provider.generate({
    system: systemPrompt(args.lang),
    user: userPrompt(args.household, planSummaryForPrompt(args.qty)),
    signal: args.signal,
  });
  return parseHealthReview(raw); // throws ParseError → UI shows last-good review
}
