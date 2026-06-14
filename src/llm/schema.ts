import { z } from 'zod';

// The one typed structure the whole app revolves around: a single honest
// suggestion for tonight. The provider is asked to return exactly this shape;
// parse.ts validates against it; the hero card renders it.

export const Confidence = z.enum(['high', 'medium', 'low']);
export type Confidence = z.infer<typeof Confidence>;

export const IngredientSchema = z.object({
  name: z.string().min(1).max(60),
  // have = already in the kitchen; otherwise it's on the small "to buy" list.
  have: z.boolean().default(true),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export const BackupOptionSchema = z.object({
  meal: z.string().min(1).max(120),
  note: z.string().max(200).optional().default(''),
});
export type BackupOption = z.infer<typeof BackupOptionSchema>;

export const SuggestionSchema = z.object({
  meal: z.string().min(1).max(120),
  // One warm line under the dish name.
  tagline: z.string().max(220).optional().default(''),
  // "Why this works for your house" — references their real constraints.
  why: z.string().min(1).max(600),
  // Approximate rupee cost for the household, e.g. "≈ ₹70 for 4".
  costApprox: z.string().min(1).max(60),
  costConfidence: Confidence,
  ingredients: z.array(IngredientSchema).min(1).max(20),
  steps: z.array(z.string().min(1).max(300)).min(1).max(6),
  leftoverIdea: z.string().max(300).optional().default(''),
  confidence: Confidence,
  // One calm line explaining the confidence, honestly.
  confidenceNote: z.string().max(300).optional().default(''),
  // Present (and meaningful) especially when confidence is medium/low.
  backupOption: BackupOptionSchema.optional().nullable(),
});

export type Suggestion = z.infer<typeof SuggestionSchema>;

// The gentle health-scrutiny review of the provisioning plan: soft, member-aware
// swaps a household can accept or wave off. Never medical targets/portions.
export const HealthSwapSchema = z.object({
  title: z.string().min(1).max(120),
  sub: z.string().min(1).max(220),
});
export const HealthReviewSchema = z.object({
  note: z.string().max(280).optional().default(''),
  swaps: z.array(HealthSwapSchema).min(1).max(5),
});
export type HealthReview = z.infer<typeof HealthReviewSchema>;

export const HEALTH_SHAPE = `{
  "note": string,                       // one calm line; defer medical numbers to the family's doctor
  "swaps": [ { "title": string, "sub": string } ]  // 2 to 4 gentle, member-aware sourcing swaps
}`;

// A compact JSON-shape description we hand the model in the prompt.
export const SUGGESTION_SHAPE = `{
  "meal": string,                       // the dish name (the star)
  "tagline": string,                    // one short warm line under the name
  "why": string,                        // why this works for THIS house, referencing their constraints
  "costApprox": string,                 // e.g. "≈ ₹70 for 4"
  "costConfidence": "high"|"medium"|"low",
  "ingredients": [ { "name": string, "have": boolean } ],  // have=true if likely already in their kitchen
  "steps": [ string, ... ],             // 3 to 5 simple steps
  "leftoverIdea": string,               // a gentle idea for leftovers (may be "")
  "confidence": "high"|"medium"|"low",
  "confidenceNote": string,             // one honest, reassuring line
  "backupOption": { "meal": string, "note": string } | null  // a calmer simpler option, esp. if confidence < high
}`;
