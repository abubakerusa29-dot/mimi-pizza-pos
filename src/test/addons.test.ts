import { describe, it, expect } from "vitest";
import { addonsForProduct } from "@/lib/addons";
import { products } from "@/data/menuData";

describe("add-ons", () => {
  it("pizza extra topping follows size", () => {
    expect(addonsForProduct("pz-bbq", "pizza", "Small").find((a) => a.name.startsWith("Extra Topping"))?.price).toBe(100);
    expect(addonsForProduct("pz-bbq", "pizza", "Medium").find((a) => a.name.startsWith("Extra Topping"))?.price).toBe(150);
    expect(addonsForProduct("pz-bbq", "pizza", "Large").find((a) => a.name.startsWith("Extra Topping"))?.price).toBe(200);
    expect(addonsForProduct("pz-bbq", "pizza", "Family").find((a) => a.name.startsWith("Extra Topping"))?.price).toBe(300);
  });
  it("burgers offer cheese slice Rs.100, no extra patty item", () => {
    expect(addonsForProduct("bg-zinger", "burgers").find((a) => a.name === "Cheese Slice")?.price).toBe(100);
    expect(products.find((p) => p.id === "ex-patty")).toBeUndefined();
  });
  it("peri peri sauce is Rs.150", () => {
    expect(addonsForProduct("bg-zinger", "burgers").find((a) => a.name === "Peri Peri Sauce")?.price).toBe(150);
  });
  it("soft drinks offer Coke, Sprite, Pepsi", () => {
    const d = products.find((p) => p.id === "dr-tin")!;
    expect(d.sizes?.map((s) => s.size)).toEqual(expect.arrayContaining(["Coke", "Sprite", "Pepsi"]));
    expect(d.sizes?.[0]?.price).toBe(120);
  });
});
