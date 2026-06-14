import Dexie, { type Table } from 'dexie';
import type { Suggestion } from '@/llm/schema';

// ----------------------------------------------------------------------------
// Everything Tripti knows lives here, in the browser's IndexedDB. No servers.
// ----------------------------------------------------------------------------

export type Lang = 'en' | 'hinglish' | 'regional';
// 'groq' = bring-your-own free-tier key (via proxy). 'shared' = operator-provided
// key, used server-side only (the client never sees it).
export type ProviderType = 'anthropic' | 'openai' | 'gemini' | 'groq' | 'shared' | 'ondevice';
export type OnDeviceBackend = 'prompt-api' | 'custom-openai' | 'webllm';
export type Verdict = 'yes' | 'almost' | 'no';

export interface Member {
  name: string;
  dislikes: string[];
  healthNotes: string[];
}

export interface Household {
  id: number; // always 1 — single household per device
  members: Member[];
  region: string; // e.g. 'maharashtrian'
  diet: 'veg' | 'egg' | 'nonveg';
  exclusions: string[]; // strict no-gos: 'no-onion-garlic', 'no-egg', 'peanut-allergy', 'jain'
  houseRules: string[]; // pooja/fasting/veg-days etc. (free text, sanitized)
  budgetBand: 'tight' | 'comfortable' | 'flexible';
  pantryDefaults: string[]; // staples usually at home
  activeContext: string; // 'someone-unwell' | 'little-kids' | 'guest-this-week' | 'just-us'
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  id: number; // always 1
  lang: Lang;
  onboarded: boolean;
  providerConfigured: boolean;
}

export interface ProviderConfig {
  id: number; // always 1
  type: ProviderType;
  model: string;
  apiKey?: string; // cloud only — stored ONLY here, on this device
  endpoint?: string; // on-device custom OpenAI-compatible base URL
  onDeviceBackend?: OnDeviceBackend;
  updatedAt: number;
}

export interface MealRecord {
  id?: number;
  meal: string;
  suggestion: Suggestion; // full typed payload, so Cook-It-Again needs zero AI
  verdict: Verdict; // how it landed
  timesCooked: number;
  source: 'ai' | 'again' | 'fallback';
  createdAt: number;
  lastCookedAt: number;
}

export interface RejectionMemory {
  id?: number;
  meal: string;
  reason: string; // the chosen "Almost/No" reason, sanitized
  createdAt: number;
}

// "Almost" → a single clarifying answer that nudges future suggestions.
export interface FeedbackNote {
  id?: number;
  meal: string;
  note: string;
  createdAt: number;
}

export interface SavedRecipe {
  id?: number;
  meal: string;
  suggestion: Suggestion;
  savedAt: number;
}

export interface PriceItem {
  id?: number;
  item: string;
  price: number; // rupees
  unit: string; // 'kg', 'each', 'L'…
  updatedAt: number;
}

// The six-month provisioning plan: only the household's quantities + budget
// target + accepted health swaps are stored; the catalog lives in code.
export interface ProvisioningPlan {
  id: number; // always 1
  qty: Record<string, number>;
  target: number;
  acceptedSwaps: string[]; // titles of swaps the household added
  updatedAt: number;
}

export interface HealthSwap {
  title: string;
  sub: string;
}
// Last good AI review, kept so the parse-fallback can show it (never hardcoded).
export interface HealthReviewRecord {
  id: number; // always 1
  swaps: HealthSwap[];
  note: string;
  updatedAt: number;
}

class TriptiDB extends Dexie {
  household!: Table<Household, number>;
  settings!: Table<Settings, number>;
  providerConfig!: Table<ProviderConfig, number>;
  mealHistory!: Table<MealRecord, number>;
  rejectionMemory!: Table<RejectionMemory, number>;
  feedbackNotes!: Table<FeedbackNote, number>;
  savedRecipes!: Table<SavedRecipe, number>;
  priceList!: Table<PriceItem, number>;
  provisioning!: Table<ProvisioningPlan, number>;
  healthReview!: Table<HealthReviewRecord, number>;

  constructor() {
    super('tripti');
    this.version(1).stores({
      household: 'id',
      settings: 'id',
      providerConfig: 'id',
      mealHistory: '++id, meal, verdict, lastCookedAt',
      rejectionMemory: '++id, meal, createdAt',
      feedbackNotes: '++id, createdAt',
      savedRecipes: '++id, meal, savedAt',
      priceList: '++id, item',
    });
    // v2 adds the sourcing/provisioning feature.
    this.version(2).stores({
      provisioning: 'id',
      healthReview: 'id',
    });
  }
}

// Guard against SSR — Dexie only exists in the browser.
let _db: TriptiDB | null = null;
export function db(): TriptiDB {
  if (typeof window === 'undefined') {
    throw new Error('Tripti DB is browser-only (IndexedDB). Use it inside client code.');
  }
  if (!_db) _db = new TriptiDB();
  return _db;
}
