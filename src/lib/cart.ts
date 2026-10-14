import type { Product } from "@/data/menuData";

export interface CartLine {
  key: string; // product id + variant, so identical items merge
  name: string;
  variant?: string | undefined; // size or flavour
  description?: string | undefined;
  unitPrice: number;
  qty: number;
  addons?: string[] | undefined;
  addonGroup?: "burger" | undefined;
}

export const formatRs = (n: number) => `Rs. ${n.toLocaleString("en-US")}`;

export const lineTotal = (l: CartLine) => l.unitPrice * l.qty;

export const cartTotals = (lines: CartLine[]) => {
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const items = lines.reduce((s, l) => s + l.qty, 0);
  return { subtotal, total: subtotal, items };
};

export const startingPrice = (p: Product) =>
  p.sizes ? Math.min(...p.sizes.map((s) => s.price)) : (p.price ?? 0);

export function addLine(lines: CartLine[], item: Omit<CartLine, "qty">): CartLine[] {
  const found = lines.find((l) => l.key === item.key);
  if (found) return lines.map((l) => (l.key === item.key ? { ...l, qty: l.qty + 1 } : l));
  return [...lines, { ...item, qty: 1 }];
}

export function changeQty(lines: CartLine[], key: string, delta: number): CartLine[] {
  return lines
    .map((l) => (l.key === key ? { ...l, qty: Math.max(0, l.qty + delta) } : l))
    .filter((l) => l.qty > 0);
}

export interface Addon { id: string; name: string; price: number }

/** Attach an add-on to ONE unit of a cart line (splits it off if qty > 1). */
export function applyAddon(lines: CartLine[], key: string, addon: Addon): CartLine[] {
  const src = lines.find((l) => l.key === key);
  if (!src) return lines;
  const addons = [...(src.addons ?? []), addon.name];
  const next: Omit<CartLine, "qty"> = {
    ...src,
    key: `${key}+${addon.id}`,
    addons,
    unitPrice: src.unitPrice + addon.price,
  };
  const rest = changeQty(lines, key, -1);
  return addLine(rest, next);
}
