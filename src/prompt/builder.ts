import type { Household, Lang } from '@/data/db';
import { SUGGESTION_SHAPE } from '@/llm/schema';
import { sanitizeForPrompt, sanitizeListForPrompt } from '@/lib/sanitize';

// Tonight's context from the daily-input screen.
export interface DailyContext {
  pantry: string[]; // ingredients tapped as "available"
  cook: string; // who's cooking
  energy: 'low' | 'okay' | 'up';
  constraints: string[]; // 'tight budget', 'quick only', 'guest coming', 'tiffin needed'
  special?: string; // active context tag, optional
}

export interface BuildInput {
  household?: Household;
  context: DailyContext;
  lang: Lang;
  rejections?: { meal: string; reason: string }[]; // No-memory to steer away from
  recentNotes?: { meal: string; note: string }[]; // Almost-clarifications
}

const LANG_INSTRUCTION: Record<Lang, string> = {
  en: 'Write all human-readable text in clear, simple English.',
  hinglish:
    'Write all human-readable text in warm Hinglish (Hindi-English mix in Latin script), the way a friendly home cook would speak.',
  regional:
    'Write all human-readable text in simple Hindi using Devanagari script (हिंदी), warm and homely.',
};

const ENERGY_LABEL: Record<DailyContext['energy'], string> = {
  low: 'a bit tired — keep it low-effort, one pot if possible',
  okay: 'okay — a normal amount of effort is fine',
  up: 'up for it — a slightly more involved dish is welcome',
};

// The system prompt fixes Tripti's character and the OUTPUT CONTRACT (one JSON
// object matching the Suggestion schema). Stable across requests (cache-friendly).
export function buildSystemPrompt(lang: Lang): string {
  return [
    'You are Tripti, a calm, warm food companion for an Indian household.',
    'You suggest ONE realistic home-cooked meal for tonight, like a trusted family friend who knows this house.',
    'You are NOT a diet coach. Never preach about health, never imply the family eats wrong, never use calorie/macro language.',
    'Be honest about confidence and cost. If you are unsure, say so calmly and offer a simpler backup — never alarm.',
    'Prefer what is already in their kitchen; respect every dietary exclusion and house rule absolutely.',
    LANG_INSTRUCTION[lang],
    '',
    'Respond with ONLY a single JSON object — no markdown fence, no prose before or after.',
    'The JSON must match exactly this shape:',
    SUGGESTION_SHAPE,
    '',
    'Rules: 3–5 simple steps. Mark ingredients have=true when they are likely already in this kitchen.',
    'Set confidence/costConfidence honestly to "high", "medium", or "low". When confidence is not "high", include a calmer, simpler backupOption.',
  ].join('\n');
}

// The user prompt carries THIS house and THIS evening. All free text is sanitized
// against prompt-injection before it lands here.
export function buildUserPrompt(input: BuildInput): string {
  const { household, context } = input;
  const lines: string[] = [];

  lines.push("Here is what you know about this house and tonight. Suggest tonight's meal.");
  lines.push('');

  if (household) {
    lines.push('HOUSEHOLD:');
    lines.push(`- Cooking style / region: ${sanitizeForPrompt(household.region, 40) || 'mixed Indian'}`);
    lines.push(`- Diet: ${household.diet}`);
    if (household.exclusions.length) {
      lines.push(`- Strict exclusions (NEVER include): ${sanitizeListForPrompt(household.exclusions).join(', ')}`);
    }
    if (household.houseRules.length) {
      lines.push(`- House rules: ${sanitizeListForPrompt(household.houseRules).join(', ')}`);
    }
    lines.push(`- Budget band: ${household.budgetBand}`);
    if (household.members.length) {
      const members = household.members
        .map((m) => {
          const bits: string[] = [sanitizeForPrompt(m.name, 40) || 'someone'];
          if (m.dislikes.length) bits.push(`dislikes ${sanitizeListForPrompt(m.dislikes).join('/')}`);
          if (m.healthNotes.length) bits.push(`notes: ${sanitizeListForPrompt(m.healthNotes).join('/')}`);
          return '  · ' + bits.join('; ');
        })
        .join('\n');
      lines.push('- Members:');
      lines.push(members);
    }
    if (household.activeContext) {
      lines.push(`- Right now: ${sanitizeForPrompt(household.activeContext, 40)}`);
    }
    lines.push('');
  }

  lines.push('TONIGHT:');
  const pantry = sanitizeListForPrompt(context.pantry);
  lines.push(`- Available in the kitchen: ${pantry.length ? pantry.join(', ') : 'not sure — keep it flexible'}`);
  lines.push(`- Who's cooking: ${sanitizeForPrompt(context.cook, 40) || 'whoever is home'}`);
  lines.push(`- Energy: ${ENERGY_LABEL[context.energy]}`);
  const cons = sanitizeListForPrompt(context.constraints);
  if (cons.length) lines.push(`- Special tonight: ${cons.join(', ')}`);
  if (context.special) lines.push(`- Note: ${sanitizeForPrompt(context.special, 40)}`);
  lines.push('');

  if (input.rejections?.length) {
    const r = input.rejections
      .slice(0, 8)
      .map((x) => `${sanitizeForPrompt(x.meal, 60)}${x.reason ? ` (${sanitizeForPrompt(x.reason, 40)})` : ''}`)
      .join('; ');
    lines.push(`AVOID suggesting these recently-rejected meals: ${r}`);
  }
  if (input.recentNotes?.length) {
    const n = input.recentNotes
      .slice(0, 6)
      .map((x) => `${sanitizeForPrompt(x.meal, 60)}: ${sanitizeForPrompt(x.note, 40)}`)
      .join('; ');
    lines.push(`Recent feedback to learn from: ${n}`);
  }

  return lines.join('\n');
}
