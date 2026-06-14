import { SuggestionSchema, type Suggestion } from './schema';
import { cleanText } from '@/lib/sanitize';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

// Pull the first balanced JSON object out of raw model text, tolerating a stray
// ```json fence or a sentence of preamble that a model might add despite instructions.
function extractJsonObject(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = (fenced ? fenced[1] : raw).trim();

  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Validate raw provider text into a typed Suggestion. Throws ParseError when the
 * model's reply can't be coerced into the schema — the caller then shows the calm
 * parse-fallback (a real already-loved meal), never a stack trace.
 */
export function parseSuggestion(raw: string): Suggestion {
  const jsonStr = extractJsonObject(raw);
  if (!jsonStr) throw new ParseError('No JSON object found in the response.');

  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    throw new ParseError('Response was not valid JSON.');
  }

  const result = SuggestionSchema.safeParse(data);
  if (!result.success) {
    throw new ParseError('Response did not match the expected shape.');
  }

  // Clean every rendered string field (XSS defense — the key lives in the page).
  return sanitizeSuggestion(result.data);
}

function sanitizeSuggestion(s: Suggestion): Suggestion {
  return {
    ...s,
    meal: cleanText(s.meal, 120),
    tagline: cleanText(s.tagline, 220),
    why: cleanText(s.why, 600),
    costApprox: cleanText(s.costApprox, 60),
    leftoverIdea: cleanText(s.leftoverIdea, 300),
    confidenceNote: cleanText(s.confidenceNote, 300),
    ingredients: s.ingredients.map((i) => ({ name: cleanText(i.name, 60), have: i.have })),
    steps: s.steps.map((st) => cleanText(st, 300)),
    backupOption: s.backupOption
      ? { meal: cleanText(s.backupOption.meal, 120), note: cleanText(s.backupOption.note, 200) }
      : s.backupOption,
  };
}
