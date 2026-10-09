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
