import { products, type Product } from "@/data/menuData";

export interface DealPizzaOption { label: string; kind: "Regular" | "Special"; diff: number }

const SIZE_RE = /(Regular|Special)\s+(Small|Medium|Large|Family)\s+Pizza/i;

/** Finds the first included pizza in a deal (e.g. "Regular Small Pizza"). */
export function dealPizza(deal: Product): { kind: "Regular" | "Special"; size: string } | null {
  if (deal.category !== "deals") return null;
  const m = SIZE_RE.exec(deal.description ?? "");
  if (!m) return null;
  const kind = m[1]!.toLowerCase() === "special" ? "Special" : "Regular";
  const size = m[2]![0]!.toUpperCase() + m[2]!.slice(1).toLowerCase();
  return { kind, size };
}

const priceOf = (tag: "Regular" | "Special", size: string) =>
  products.find((p) => p.tag === tag)?.sizes?.find((s) => s.size === size)?.price;

/** Flavour choices for a deal's pizza, with the price difference vs the included pizza. */
export function dealPizzaOptions(deal: Product): DealPizzaOption[] {
  const inc = dealPizza(deal);
  if (!inc) return [];
  const base = priceOf(inc.kind, inc.size) ?? 0;
  return (["Regular", "Special"] as const).flatMap((kind) => {
    const price = priceOf(kind, inc.size);
    if (price == null) return [];
    return products
      .filter((p) => p.category === "pizza" && p.tag === kind)
      .map((p) => ({ label: p.name.replace(/ Pizza$/, ""), kind, diff: price - base }));
  });
}
