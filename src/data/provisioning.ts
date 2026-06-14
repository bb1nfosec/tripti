// The six-month provisioning catalog (rates / where-to-buy / bulk-vs-fresh) lives
// in code; only the household's quantities + budget target are stored in Dexie.

export type SourceTag = 'Bulk' | 'Fresh';

export interface CatalogItem {
  id: string;
  name: string;
  unit: string; // kg | L | pack …
  rate: number; // ₹ per unit, monthly basis
  where: string;
  tag: SourceTag;
}
export interface CatalogCategory {
  id: string;
  name: string;
  items: CatalogItem[];
}

export const PROVISIONING_CATALOG: CatalogCategory[] = [
  {
    id: 'grains',
    name: 'Grains & millets',
    items: [
      { id: 'rice', name: 'Sona masuri rice', unit: 'kg', rate: 62, where: 'Wholesale · APMC', tag: 'Bulk' },
      { id: 'millet', name: 'Native millets mix', unit: 'kg', rate: 95, where: 'Millet store', tag: 'Bulk' },
      { id: 'atta', name: 'Chakki atta', unit: 'kg', rate: 48, where: 'Wholesale · APMC', tag: 'Bulk' },
    ],
  },
  {
    id: 'dals',
    name: 'Dals & pulses',
    items: [
      { id: 'toor', name: 'Toor dal', unit: 'kg', rate: 140, where: 'Wholesale · APMC', tag: 'Bulk' },
      { id: 'moong', name: 'Moong dal', unit: 'kg', rate: 120, where: 'Wholesale · APMC', tag: 'Bulk' },
      { id: 'chana', name: 'Chana', unit: 'kg', rate: 85, where: 'Wholesale · APMC', tag: 'Bulk' },
    ],
  },
  {
    id: 'oils',
    name: 'Oils & ghee',
    items: [
      { id: 'groundnut', name: 'Cold-pressed groundnut oil', unit: 'L', rate: 210, where: 'Millet store', tag: 'Fresh' },
      { id: 'ghee', name: 'Ghee', unit: 'kg', rate: 620, where: 'Local dairy', tag: 'Fresh' },
    ],
  },
  {
    id: 'dairy',
    name: 'Dairy',
    items: [
      { id: 'milk', name: 'Milk (daily)', unit: 'L', rate: 58, where: 'Local dairy', tag: 'Fresh' },
      { id: 'curd', name: 'Curd', unit: 'kg', rate: 70, where: 'Local dairy', tag: 'Fresh' },
    ],
  },
  {
    id: 'nuts',
    name: 'Nuts & seeds',
    items: [
      { id: 'peanut', name: 'Groundnuts', unit: 'kg', rate: 130, where: 'Wholesale · APMC', tag: 'Bulk' },
      { id: 'almond', name: 'Almonds', unit: 'kg', rate: 780, where: 'Wholesale · APMC', tag: 'Bulk' },
    ],
  },
  {
    id: 'spices',
    name: 'Spices & masala',
    items: [
      { id: 'turmeric', name: 'Turmeric', unit: 'kg', rate: 240, where: 'Wholesale · APMC', tag: 'Bulk' },
      { id: 'chilli', name: 'Red chilli powder', unit: 'kg', rate: 320, where: 'Wholesale · APMC', tag: 'Bulk' },
    ],
  },
  {
    id: 'supplements',
    name: 'Supplements',
    items: [{ id: 'b12', name: 'B12 (vegetarian)', unit: 'pack', rate: 340, where: 'Pharmacy', tag: 'Fresh' }],
  },
  {
    id: 'pet',
    name: 'Pet',
    items: [{ id: 'dogfood', name: 'Dog food', unit: 'kg', rate: 160, where: 'Pet store', tag: 'Bulk' }],
  },
  {
    id: 'misc',
    name: 'Misc & household',
    items: [
      { id: 'jaggery', name: 'Jaggery', unit: 'kg', rate: 70, where: 'Wholesale · APMC', tag: 'Bulk' },
      { id: 'salt', name: 'Rock salt', unit: 'kg', rate: 30, where: 'Kirana', tag: 'Bulk' },
    ],
  },
];

export const DEFAULT_QTY: Record<string, number> = {
  rice: 10, millet: 4, atta: 10, toor: 4, moong: 2, chana: 2, groundnut: 3, ghee: 1,
  milk: 30, curd: 8, peanut: 2, almond: 1, turmeric: 1, chilli: 1, b12: 1, dogfood: 8, jaggery: 2, salt: 2,
};

export const DEFAULT_TARGET = 12000;

export function itemById(id: string): CatalogItem | undefined {
  for (const c of PROVISIONING_CATALOG) {
    const it = c.items.find((i) => i.id === id);
    if (it) return it;
  }
  return undefined;
}

// ---- Pure selectors over a qty map (no anxiety, calm money) ----
export function categorySubtotal(cat: CatalogCategory, qty: Record<string, number>): number {
  return cat.items.reduce((a, it) => a + (qty[it.id] ?? 0) * it.rate, 0);
}
export function planTotal(qty: Record<string, number>): number {
  return PROVISIONING_CATALOG.reduce((a, c) => a + categorySubtotal(c, qty), 0);
}
export function breakdown(qty: Record<string, number>) {
  const total = planTotal(qty) || 1;
  return PROVISIONING_CATALOG.map((c) => ({ name: c.name, val: categorySubtotal(c, qty) }))
    .filter((b) => b.val > 0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 6)
    .map((b) => ({ name: b.name, val: b.val, pct: Math.round((b.val / total) * 100) }));
}
export function rupees(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// A compact, sanitized plan summary for the health-review prompt.
export function planSummaryForPrompt(qty: Record<string, number>): string {
  return PROVISIONING_CATALOG.map((c) => {
    const items = c.items
      .filter((it) => (qty[it.id] ?? 0) > 0)
      .map((it) => `${it.name} ${qty[it.id]}${it.unit}`)
      .join(', ');
    return items ? `${c.name}: ${items}` : '';
  })
    .filter(Boolean)
    .join('; ');
}
