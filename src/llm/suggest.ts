import type { LLMProvider } from '@/providers';
import type { Household, Lang } from '@/data/db';
import { buildSystemPrompt, buildUserPrompt, type DailyContext } from '@/prompt/builder';
import { parseSuggestion } from './parse';
import type { Suggestion } from './schema';
import { getRejectionMemory, getRecentFeedbackNotes } from '@/data/repo';

export interface SuggestArgs {
  provider: LLMProvider;
  household?: Household;
  context: DailyContext;
  lang: Lang;
  signal?: AbortSignal;
  onDownloadProgress?: (fraction: number) => void;
}

// The whole evening in one path: prompt/builder → REAL provider call → parse.
// Exactly one LLM call. No agents, no chains, no second model.
export async function getSuggestion(args: SuggestArgs): Promise<Suggestion> {
  const [rejections, recentNotes] = await Promise.all([
    getRejectionMemory().catch(() => []),
    getRecentFeedbackNotes().catch(() => []),
  ]);

  const system = buildSystemPrompt(args.lang);
  const user = buildUserPrompt({
    household: args.household,
    context: args.context,
    lang: args.lang,
    rejections: rejections.map((r) => ({ meal: r.meal, reason: r.reason })),
    recentNotes: recentNotes.map((n) => ({ meal: n.meal, note: n.note })),
  });

  const raw = await args.provider.generate({
    system,
    user,
    signal: args.signal,
    onDownloadProgress: args.onDownloadProgress,
  });
  return parseSuggestion(raw); // throws ParseError → UI shows the comforting-favourite fallback
}

export type { Suggestion };
