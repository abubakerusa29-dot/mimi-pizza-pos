import type { Product } from "@/data/menuData";

/** Owner edits: price per product (key "id" or "id|size") and hidden items. */
export interface MenuOverrides { prices: Record<string, number>; hidden: string[] }
export const emptyOverrides: MenuOverrides = { prices: {}, hidden: [] };

export const priceKey = (id: string, size?: string) => (size ? `${id}|${size}` : id);

/** Returns the menu with edited prices applied (unavailable items keep `hidden` flag via filter). */
export function applyOverrides(list: Product[], o: MenuOverrides): Product[] {
  return list.map((p) => ({
    ...p,
    price: p.price !== undefined ? o.prices[priceKey(p.id)] ?? p.price : undefined,
    sizes: p.sizes?.map((s) => ({ ...s, price: o.prices[priceKey(p.id, s.size)] ?? s.price })),
  }));
}

export const availableOnly = (list: Product[], o: MenuOverrides) => list.filter((p) => !o.hidden.includes(p.id));
