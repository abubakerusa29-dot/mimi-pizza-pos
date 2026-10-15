import type { Product } from "@/data/menuData";

/** Owner edits: price per product (key "id" or "id|size") and hidden items. */
export interface MenuOverrides { prices: Record<string, number>; hidden: string[] }
export const emptyOverrides: MenuOverrides = { prices: {}, hidden: [] };

export const priceKey = (id: string, size?: string) => (size ? `${id}|${size}` : id);

/** Returns the menu with edited prices applied (unavailable items keep `hidden` flag via filter). */
export function applyOverrides(list: Product[], o: MenuOverrides): Product[] {
  return list.map((p) => {
    const next: Product = { ...p };
    if (p.price !== undefined) next.price = o.prices[priceKey(p.id)] ?? p.price;
    if (p.sizes) next.sizes = p.sizes.map((s) => ({ ...s, price: o.prices[priceKey(p.id, s.size)] ?? s.price }));
    return next;
  });
}

export const availableOnly = (list: Product[], o: MenuOverrides) => list.filter((p) => !o.hidden.includes(p.id));
