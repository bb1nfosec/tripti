// Two jobs, both mandatory because the API key lives in the page:
//   1. Clean free text BEFORE it enters a prompt (prompt-injection hardening).
//   2. Clean any model/free text BEFORE it is rendered (XSS hardening).
//
// All LLM output is rendered through React text nodes (auto-escaped), and we
// never use dangerouslySetInnerHTML — cleanText() is the belt to that braces.

const ZERO_WIDTH = /[​-‍⁠﻿]/g;
// Strip C0/C1 control chars but keep \n (\x0A) and \t (\x09).
const CONTROL = /[\x00-\x08\x0B-\x1F\x7F-\x9F]/g;

/**
 * Sanitize a free-text field that the household types (pantry item, dislike,
 * feedback note) before it is interpolated into the LLM prompt.
 *
 * - removes control + zero-width chars (used to smuggle hidden instructions)
 * - collapses runaway whitespace
 * - neutralizes lines that imitate prompt/role delimiters
 * - hard-caps length so a field can't blow out the context or hide a payload
 */
export function sanitizeForPrompt(input: unknown, maxLen = 280): string {
  if (typeof input !== 'string') return '';
  let s = input.normalize('NFC').replace(ZERO_WIDTH, '').replace(CONTROL, '');
  // Defang common injection delimiters / role spoofing without mangling real words.
  s = s
    .replace(/```+/g, ' ')
    .replace(/<\/?(system|user|assistant|tool)\b[^>]*>/gi, ' ')
    .replace(/\b(system|assistant|developer)\s*:/gi, '$1 ')
    .replace(/\b(ignore|disregard|forget)\s+(all|any|the|previous|above|prior)\b/gi, '[$1 $2]');
  // Collapse whitespace runs; keep it to a single tidy line.
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length > maxLen) s = s.slice(0, maxLen).trim() + '…';
  return s;
}

/** Sanitize an array of free-text tags/items for the prompt. */
export function sanitizeListForPrompt(items: unknown, maxItems = 30, maxLen = 60): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((i) => sanitizeForPrompt(i, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * Clean a string for safe rendering. We render through React (escaped) and
 * never inject HTML, but we still strip tags + control chars so nothing odd
 * from the model or an old saved profile can surprise us.
 */
export function cleanText(input: unknown, maxLen = 2000): string {
  if (typeof input !== 'string') return '';
  let s = input.normalize('NFC').replace(ZERO_WIDTH, '').replace(CONTROL, '');
  s = s.replace(/<[^>]*>/g, '');
  if (s.length > maxLen) s = s.slice(0, maxLen).trim() + '…';
  return s;
}
