import {
  db,
  type Household,
  type Settings,
  type ProviderConfig,
  type Lang,
  type Verdict,
  type MealRecord,
  type ProvisioningPlan,
  type HealthReviewRecord,
  type HealthSwap,
} from './db';
import type { Suggestion } from '@/llm/schema';
import { sanitizeForPrompt } from '@/lib/sanitize';
import { DEFAULT_QTY, DEFAULT_TARGET } from './provisioning';

const now = () => Date.now();

// ---- Settings -------------------------------------------------------------
export async function getSettings(): Promise<Settings> {
  const s = await db().settings.get(1);
  if (s) return s;
  const fresh: Settings = { id: 1, lang: 'hinglish', onboarded: false, providerConfigured: false };
  await db().settings.put(fresh);
  return fresh;
}

export async function setLang(lang: Lang): Promise<void> {
  const s = await getSettings();
  await db().settings.put({ ...s, lang });
}

export async function markOnboarded(): Promise<void> {
  const s = await getSettings();
  await db().settings.put({ ...s, onboarded: true });
}

// ---- Household ------------------------------------------------------------
export async function getHousehold(): Promise<Household | undefined> {
  return db().household.get(1);
}

export async function saveHousehold(
  input: Omit<Household, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const existing = await db().household.get(1);
  const record: Household = {
    id: 1,
    ...input,
    // Sanitize free-text-ish fields on the way in (defense in depth).
    houseRules: input.houseRules.map((r) => sanitizeForPrompt(r, 80)).filter(Boolean),
    pantryDefaults: input.pantryDefaults.map((r) => sanitizeForPrompt(r, 40)).filter(Boolean),
    members: input.members.map((m) => ({
      name: sanitizeForPrompt(m.name, 40),
      dislikes: m.dislikes.map((d) => sanitizeForPrompt(d, 40)).filter(Boolean),
      healthNotes: m.healthNotes.map((d) => sanitizeForPrompt(d, 60)).filter(Boolean),
    })),
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
  await db().household.put(record);
}

// ---- Provider config -----------------------------------------------------
export async function getProviderConfig(): Promise<ProviderConfig | undefined> {
  return db().providerConfig.get(1);
}

export async function saveProviderConfig(
  cfg: Omit<ProviderConfig, 'id' | 'updatedAt'>
): Promise<void> {
  await db().providerConfig.put({ id: 1, ...cfg, updatedAt: now() });
  const s = await getSettings();
  await db().settings.put({ ...s, providerConfigured: true });
}

export async function clearApiKey(): Promise<void> {
  const cfg = await getProviderConfig();
  if (!cfg) return;
  await db().providerConfig.put({ ...cfg, apiKey: undefined, updatedAt: now() });
}

// ---- Meal history & feedback ---------------------------------------------

/** Yes → remember it (or bump its cook count). */
export async function recordYes(suggestion: Suggestion): Promise<void> {
  const existing = await db().mealHistory.where('meal').equals(suggestion.meal).first();
  if (existing?.id != null) {
    await db().mealHistory.update(existing.id, {
      timesCooked: existing.timesCooked + 1,
      lastCookedAt: now(),
      verdict: 'yes',
      suggestion,
    });
  } else {
    const rec: MealRecord = {
      meal: suggestion.meal,
      suggestion,
      verdict: 'yes',
      timesCooked: 1,
      source: 'ai',
      createdAt: now(),
      lastCookedAt: now(),
    };
    await db().mealHistory.add(rec);
  }
}

/** No → steer clear next time. */
export async function recordNo(meal: string, reason: string): Promise<void> {
  await db().rejectionMemory.add({
    meal: sanitizeForPrompt(meal, 120),
    reason: sanitizeForPrompt(reason, 80),
    createdAt: now(),
  });
}

/** Almost → keep the single clarifying answer to nudge tomorrow. */
export async function recordAlmost(meal: string, note: string): Promise<void> {
  await db().feedbackNotes.add({
    meal: sanitizeForPrompt(meal, 120),
    note: sanitizeForPrompt(note, 80),
    createdAt: now(),
  });
}

export async function recordFeedback(
  verdict: Verdict,
  suggestion: Suggestion,
  reason?: string
): Promise<void> {
  if (verdict === 'yes') return recordYes(suggestion);
  if (verdict === 'no') return recordNo(suggestion.meal, reason ?? '');
  return recordAlmost(suggestion.meal, reason ?? '');
}

/** Cook-It-Again: reload a known meal from Dexie, zero AI. */
export async function cookAgain(id: number): Promise<MealRecord | undefined> {
  const rec = await db().mealHistory.get(id);
  if (!rec?.id) return rec;
  await db().mealHistory.update(rec.id, {
    timesCooked: rec.timesCooked + 1,
    lastCookedAt: now(),
  });
  return db().mealHistory.get(id);
}

export async function getMealHistory(): Promise<MealRecord[]> {
  const all = await db().mealHistory.toArray();
  return all.sort((a, b) => b.lastCookedAt - a.lastCookedAt);
}

/**
 * The parse-fallback meal: a real, already-accepted favourite — NEVER hardcoded.
 * Returns undefined when history is empty (caller then asks one clarifying Q).
 */
export async function getComfortFavourite(): Promise<MealRecord | undefined> {
  const yes = await db().mealHistory.where('verdict').equals('yes').toArray();
  if (yes.length === 0) return undefined;
  // The most-cooked, then most-recent.
  yes.sort((a, b) => b.timesCooked - a.timesCooked || b.lastCookedAt - a.lastCookedAt);
  return yes[0];
}

export async function getRejectionMemory() {
  return db().rejectionMemory.orderBy('createdAt').reverse().limit(20).toArray();
}

export async function getRecentFeedbackNotes() {
  return db().feedbackNotes.orderBy('createdAt').reverse().limit(10).toArray();
}

// ---- Saved recipes & local price list ------------------------------------
export async function saveRecipe(suggestion: Suggestion): Promise<void> {
  await db().savedRecipes.add({ meal: suggestion.meal, suggestion, savedAt: now() });
}

export async function getSavedRecipes() {
  return db().savedRecipes.orderBy('savedAt').reverse().toArray();
}

export async function getPriceList() {
  return db().priceList.toArray();
}

/** A tiny starter price table so the offline "local prices" view isn't empty. */
export async function ensurePriceSeed(): Promise<void> {
  const count = await db().priceList.count();
  if (count > 0) return;
  const seed = [
    { item: 'Toor dal', price: 140, unit: 'kg' },
    { item: 'Rice', price: 60, unit: 'kg' },
    { item: 'Onion', price: 30, unit: 'kg' },
    { item: 'Tomato', price: 40, unit: 'kg' },
    { item: 'Palak', price: 20, unit: 'bunch' },
    { item: 'Milk', price: 56, unit: 'L' },
  ];
  await db().priceList.bulkAdd(seed.map((s) => ({ ...s, updatedAt: now() })));
}

// ---- Provisioning plan ----------------------------------------------------
export async function getPlan(): Promise<ProvisioningPlan> {
  const p = await db().provisioning.get(1);
  if (p) return p;
  const fresh: ProvisioningPlan = {
    id: 1,
    qty: { ...DEFAULT_QTY },
    target: DEFAULT_TARGET,
    acceptedSwaps: [],
    updatedAt: now(),
  };
  await db().provisioning.put(fresh);
  return fresh;
}

export async function ensurePlanSeed(): Promise<void> {
  const count = await db().provisioning.count();
  if (count === 0) await getPlan();
}

export async function setQty(itemId: string, qty: number): Promise<void> {
  const p = await getPlan();
  const next = Math.max(0, Math.round(qty));
  await db().provisioning.put({ ...p, qty: { ...p.qty, [itemId]: next }, updatedAt: now() });
}

export async function nudgeQty(itemId: string, delta: number): Promise<void> {
  const p = await getPlan();
  const cur = p.qty[itemId] ?? 0;
  await setQty(itemId, cur + delta);
}

export async function setTarget(target: number): Promise<void> {
  const p = await getPlan();
  await db().provisioning.put({ ...p, target: Math.max(0, Math.round(target)), updatedAt: now() });
}

export async function acceptSwap(title: string): Promise<void> {
  const p = await getPlan();
  const clean = sanitizeForPrompt(title, 120);
  if (!clean || p.acceptedSwaps.includes(clean)) return;
  await db().provisioning.put({ ...p, acceptedSwaps: [...p.acceptedSwaps, clean], updatedAt: now() });
}

// ---- Health review (last-good for the parse fallback) ---------------------
export async function getLastHealthReview(): Promise<HealthReviewRecord | undefined> {
  return db().healthReview.get(1);
}

export async function saveHealthReview(swaps: HealthSwap[], note: string): Promise<void> {
  await db().healthReview.put({ id: 1, swaps, note, updatedAt: now() });
}
