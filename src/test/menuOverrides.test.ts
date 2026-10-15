import { describe, it, expect } from "vitest";
import { applyOverrides, availableOnly } from "@/lib/menuOverrides";
import type { Product } from "@/data/menuData";

const list: Product[] = [
  { id: "a", name: "A", category: "drinks", price: 100 },
  { id: "b", name: "B", category: "pizza", sizes: [{ size: "Small", price: 650 }, { size: "Large", price: 1600 }] },
];

describe("menu management", () => {
  it("applies an edited fixed price", () => {
    expect(applyOverrides(list, { prices: { a: 150 }, hidden: [] })[0].price).toBe(150);
  });
  it("applies an edited size price only to that size", () => {
    const b = applyOverrides(list, { prices: { "b|Large": 1700 }, hidden: [] })[1];
    expect(b.sizes?.map((s) => s.price)).toEqual([650, 1700]);
  });
  it("removes unavailable items from the order screen", () => {
    expect(availableOnly(list, { prices: {}, hidden: ["a"] }).map((p) => p.id)).toEqual(["b"]);
  });
});
