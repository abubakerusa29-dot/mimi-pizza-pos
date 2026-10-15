import { describe, it, expect } from "vitest";
import { findCustomer, upsertCustomer, profitReport, isLowStock } from "@/lib/backOffice";

describe("back office", () => {
  it("finds a saved customer by phone ignoring dashes", () => {
    const list = upsertCustomer([], { phone: "0342-6313348", name: "Ali", address: "DHA", notes: "" });
    expect(findCustomer(list, "03426313348")?.address).toBe("DHA");
  });
  it("profit is sales minus expenses in range", () => {
    const r = profitReport([{ date: new Date(2026, 9, 10), lines: [{ key: "a", name: "P", unitPrice: 1000, qty: 2 } as never] }], [{ id: "1", date: "2026-10-10", type: "Rent", reason: "", amount: 500 }, { id: "2", date: "2026-11-01", type: "Rent", reason: "", amount: 900 }], "2026-10-01", "2026-10-31");
    expect(r).toMatchObject({ sales: 2000, spent: 500, profit: 1500 });
  });
  it("flags low stock at alert level", () => {
    expect(isLowStock({ id: "b", name: "Box", unit: "pcs", qty: 50, lowAt: 50 })).toBe(true);
  });
});
