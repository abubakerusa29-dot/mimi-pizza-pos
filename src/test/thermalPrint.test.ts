import { describe, it, expect } from "vitest";
import { buildEscPos, rawbtUrl } from "@/lib/thermalPrint";

const base = { lines: [{ key: "deal-1", name: "Deal 1", description: "Small Pizza, Zinger Burger", unitPrice: 1000, qty: 2 } as never], orderNo: 7, orderType: "Delivery", table: "", date: new Date(2026, 0, 1), phone: "0300", address: "Street 1", rider: "Rider 1", restaurant: { address: "Lalamusa", phone: "0312" }, paper: "80" as const };

describe("thermal print", () => {
  it("kitchen slip expands deal items and has no prices", () => {
    const s = buildEscPos({ ...base, kind: "kitchen" });
    expect(s).toContain("- Zinger Burger");
    expect(s).not.toContain("Rs.");
  });
  it("rider slip shows cash to collect and hides software credit", () => {
    const s = buildEscPos({ ...base, kind: "rider" });
    expect(s).toContain("Rs. 2,000");
    expect(s).not.toContain("03426313348");
    expect(s).not.toContain("Ecom Builder");
  });
  it("rawbt url targets the RawBT app", () => {
    expect(rawbtUrl("x")).toContain("package=ru.a402d.rawbtprinter");
  });
});
