import { products } from "@/data/menuData";
import type { Addon, CartLine } from "@/lib/cart";

/** Extra topping price per pizza size (from the printed menu). */
export const TOPPING_PRICE: Record<string, number> = { Small: 100, Medium: 150, Large: 200, Family: 300 };

const sauces: Addon[] = (products.find((p) => p.id === "ex-sauces")?.sizes ?? []).map((s) => ({ id: `sauce-${s.size}`, name: s.size, price: s.price }));
const cheese = products.find((p) => p.id === "ex-cheese-slice");

export function toppingFor(productId: string, size?: string): Addon | null {
  if (!productId.startsWith("pz-") || !size) return null;
  const price = TOPPING_PRICE[size];
  return price ? { id: `topping-${size}`, name: `Extra Topping (${size})`, price } : null;
}

/** Add-ons offered for a product + chosen option (used by POS and public menu). */
export function addonsForProduct(productId: string, category: string, size?: string): Addon[] {
  const out: Addon[] = [];
  const t = toppingFor(productId, size);
  if (t) out.push(t);
  if (category === "burgers" && cheese) out.push({ id: cheese.id, name: cheese.name, price: cheese.price ?? 0 });
  if (category !== "drinks" && category !== "extras") out.push(...sauces);
  return out;
}

export function addonsForLine(l: CartLine): Addon[] {
  if (l.key.startsWith("adj:")) return [];
  const id = l.key.split(/[|+]/)[0];
  const p = products.find((x) => x.id === id);
  if (!p) return l.addonGroup === "burger" && cheese ? [{ id: cheese.id, name: cheese.name, price: cheese.price ?? 0 }] : [];
  return addonsForProduct(p.id, p.category, l.variant);
}
