import { describe, it, expect } from "vitest";
import { makeCustomItem, applyOverrides, emptyOverrides } from "@/lib/menuOverrides";

describe("owner-added menu items", () => {
  it("requires a name and a price", () => {
    expect(makeCustomItem({ name: "", category: "burgers", description: "", price: "500", sizes: "" }, "x")).toBeNull();
    expect(makeCustomItem({ name: "Burger", category: "burgers", description: "", price: "", sizes: "" }, "x")).toBeNull();
  });
  it("parses sizes and appears on the POS menu", () => {
    const item = makeCustomItem({ name: "New Pizza", category: "pizza", description: "", price: "", sizes: "Small:650, Large:1600" }, "c1")!;
    expect(item.sizes).toEqual([{ size: "Small", price: 650 }, { size: "Large", price: 1600 }]);
    const menu = applyOverrides([], { ...emptyOverrides, custom: [item], prices: { "c1|Large": 1700 } });
    expect(menu[0]!.sizes![1]!.price).toBe(1700);
  });
});
