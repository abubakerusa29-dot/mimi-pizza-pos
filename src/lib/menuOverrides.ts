import type { Product } from "@/data/menuData";

/** Owner edits: price per product (key "id" or "id|size"), hidden items, owner-added items and their photos. */
export interface MenuOverrides {
  prices: Record<string, number>;
  hidden: string[];
  custom?: Product[];
  /** Photos for owner-added items, kept separate from pricing data. */
  images?: Record<string, string>;
}
export const emptyOverrides: MenuOverrides = { prices: {}, hidden: [], custom: [], images: {} };

export const priceKey = (id: string, size?: string) => (size ? `${id}|${size}` : id);

/** Full menu = built-in items + owner-added items. */
export const fullMenu = (base: Product[], o: MenuOverrides) => [...base, ...(o.custom ?? [])];

/** Returns the menu (including owner-added items) with edited prices applied. */
export function applyOverrides(list: Product[], o: MenuOverrides): Product[] {
  return fullMenu(list, o).map((p) => {
    const next: Product = { ...p };
    if (p.price !== undefined) next.price = o.prices[priceKey(p.id)] ?? p.price;
    if (p.sizes) next.sizes = p.sizes.map((s) => ({ ...s, price: o.prices[priceKey(p.id, s.size)] ?? s.price }));
    return next;
  });
}

export const availableOnly = (list: Product[], o: MenuOverrides) => list.filter((p) => !o.hidden.includes(p.id));

/** Builds a new owner item; sizes text like "Small:600, Large:1200". Returns null if invalid. */
export function makeCustomItem(input: { name: string; category: Product["category"]; description: string; price: string; sizes: string }, id: string): Product | null {
  const name = input.name.trim();
  if (!name) return null;
  const sizes = input.sizes.split(",").map((s) => s.split(":").map((x) => x.trim())).filter(([a, b]) => a && Number(b) > 0).map(([size, p]) => ({ size: size!, price: Math.round(Number(p)) }));
  const price = Math.round(Number(input.price));
  if (!sizes.length && !(price > 0)) return null;
  return { id, name, category: input.category, ...(input.description.trim() ? { description: input.description.trim() } : {}), ...(sizes.length ? { sizes } : { price }) };
}
