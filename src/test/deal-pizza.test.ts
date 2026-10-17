import { describe, expect, it } from "vitest";
import { products } from "@/data/menuData";
import { dealPizzaOptions } from "@/lib/dealPizza";

const deal = (id: string) => products.find((p) => p.id === id)!;
const diff = (id: string, label: string) => dealPizzaOptions(deal(id)).find((o) => o.label === label)!.diff;

describe("deal pizza swap", () => {
  it("Deal 2 small regular -> special costs Rs. 50 more", () => {
    expect(diff("deal-2", "Mimi’s Special")).toBe(50);
    expect(diff("deal-2", "Fajita")).toBe(0);
  });
  it("Deal 1 small special -> regular is Rs. 50 less", () => {
    expect(diff("deal-1", "Fajita")).toBe(-50);
  });
  it("Deal 3 medium regular -> special costs Rs. 100 more", () => {
    expect(diff("deal-3", "BBQ")).toBe(100);
  });
});
