import { describe, it, expect } from "vitest";
import { addLine, changeQty, cartTotals, formatRs, startingPrice } from "@/lib/cart";
import { products } from "@/data/menuData";

const zinger = { key: "bg-zinger", name: "Zinger Burger", unitPrice: 380 };

describe("cart billing", () => {
  it("merges repeated items and totals unit × qty", () => {
    let c = addLine([], zinger);
    c = addLine(c, zinger);
    c = addLine(c, { key: "deal-1", name: "Deal 1", unitPrice: 1460 });
    expect(c).toHaveLength(2);
    expect(cartTotals(c).total).toBe(380 * 2 + 1460);
  });
  it("removes a line at zero and never goes negative", () => {
    const c = changeQty(addLine([], zinger), "bg-zinger", -5);
    expect(c).toHaveLength(0);
  });
  it("formats rupees", () => expect(formatRs(1460)).toBe("Rs. 1,460"));
  it("Behari Kabab starts from Rs. 1,400 (no small)", () => {
    expect(startingPrice(products.find((p) => p.id === "pz-behari-kabab")!)).toBe(1400);
  });
});

import { applyAddon } from "@/lib/cart";
describe("burger add-ons", () => {
  it("adds cheese slice price to one burger only", () => {
    let c = addLine([], { key: "bg-zinger", name: "Zinger Burger", unitPrice: 380 });
    c = addLine(c, { key: "bg-zinger", name: "Zinger Burger", unitPrice: 380 });
    c = applyAddon(c, "bg-zinger", { id: "ex-cheese-slice", name: "Cheese Slice", price: 100 });
    expect(c.find((l) => l.key === "bg-zinger")?.qty).toBe(1);
    expect(c.find((l) => l.key === "bg-zinger+ex-cheese-slice")?.unitPrice).toBe(480);
    expect(cartTotals(c).total).toBe(860);
  });
});
