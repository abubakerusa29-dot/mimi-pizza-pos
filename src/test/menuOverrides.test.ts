import { describe, it, expect } from "vitest";
import { applyOverrides, availableOnly } from "@/lib/menuOverrides";
import type { Product } from "@/data/menuData";

const list: Product[] = [
  { id: "a", name: "A", category: "drinks", price: 100 },
  { id: "b", name: "B", category: "pizza", sizes: [{ size: "Small", price: 650 }, { size: "Large", price: 1600 }] },
];

describe("menu management", () => {
  it("applies an edited fixed price", () => {
    expect(applyOverrides(list, { prices: { a: 150 }, hidden: [] })[0]?.price).toBe(150);
  });
  it("applies an edited size price only to that size", () => {
    const b = applyOverrides(list, { prices: { "b|Large": 1700 }, hidden: [] })[1];
    expect(b?.sizes?.map((s) => s.price)).toEqual([650, 1700]);
  });
  it("removes unavailable items from the order screen", () => {
    expect(availableOnly(list, { prices: {}, hidden: ["a"] }).map((p) => p.id)).toEqual(["b"]);
  });
});

import { fullMenu as fm } from "@/lib/menuOverrides";
describe("deleted built-in items", () => {
  it("removes deleted ids from the menu", () => {
    const base = [{ id: "a", name: "A", category: "burgers" as const, price: 1 }, { id: "b", name: "B", category: "burgers" as const, price: 2 }];
    expect(fm(base, { prices: {}, hidden: [], deleted: ["a"] }).map((p) => p.id)).toEqual(["b"]);
  });
});

import { posMenu, publicMenu } from "@/lib/menuOverrides";
import { isStaffPin } from "@/lib/staffPin";
describe("menu visibility", () => {
  const base = [{ id: "a", name: "A", category: "burgers", price: 100 }, { id: "b", name: "B", category: "burgers", price: 200 }] as never;
  it("website-off item stays in POS but not on website", () => {
    const o = { prices: {}, hidden: [], publicHidden: ["a"] };
    expect(publicMenu(base, o).map((p) => p.id)).toEqual(["b"]);
    expect(posMenu(base, o).map((p) => p.id)).toEqual(["a", "b"]);
  });
  it("unavailable item shows nowhere", () => {
    const o = { prices: {}, hidden: ["b"] };
    expect(publicMenu(base, o).map((p) => p.id)).toEqual(["a"]);
    expect(posMenu(base, o).map((p) => p.id)).toEqual(["a"]);
  });
  it("staff PIN must be exactly 6 digits", () => {
    expect(isStaffPin("726159")).toBe(true);
    expect(isStaffPin("1234")).toBe(false);
  });
});
