import type { Product } from "@/data/menuData";

export interface CartLine {
  key: string; // product id + variant, so identical items merge
  name: string;
  variant?: string | undefined; // size or flavour
  description?: string | undefined;
  unitPrice: number;
  qty: number;
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
