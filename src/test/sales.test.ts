import { describe, it, expect } from "vitest";
import { salesSummary } from "@/lib/sales";
const l = (name: string, unitPrice: number, qty = 1) => ({ key: name, name, unitPrice, qty });

describe("sales summary", () => {
  const inv = [
    { date: new Date(2026, 9, 15, 13), orderType: "Delivery", lines: [l("Zinger", 500, 2)] },
    { date: new Date(2026, 9, 15, 20), orderType: "Dine-in", lines: [l("Pizza", 1200), l("Zinger", 500)] },
    { date: new Date(2026, 9, 14, 20), orderType: "Takeaway", lines: [l("Pizza", 1200)] },
  ];
  it("totals revenue, orders and average for the chosen day", () => {
    const s = salesSummary(inv, new Date(2026, 9, 15), new Date(2026, 9, 15));
    expect([s.orders, s.revenue, s.average]).toEqual([2, 2700, 1350]);
    expect(s.byType.Delivery).toEqual({ orders: 1, revenue: 1000 });
  });
  it("ranks best sellers by quantity", () => {
    expect(salesSummary(inv).topItems[0]).toEqual({ name: "Zinger", qty: 3, revenue: 1500 });
  });
});
