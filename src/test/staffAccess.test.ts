import { describe, expect, it } from "vitest";
import { canOpen, cashierAccess } from "@/lib/staffAccess";

const cashier = { id: "c", name: "Ali", isOwner: false, permissions: cashierAccess };
describe("staff access", () => {
  it("cashier can take orders, assign riders and use tables", () => {
    expect(canOpen(cashier, "/pos")).toBe(true);
    expect(canOpen(cashier, "/riders")).toBe(true);
    expect(canOpen(cashier, "/tables")).toBe(true);
  });
  it("cashier cannot see finance pages", () => {
    expect(canOpen(cashier, "/sales")).toBe(false);
    expect(canOpen(cashier, "/expenses")).toBe(false);
    expect(canOpen(cashier, "/reports")).toBe(false);
  });
  it("team and settings are owner only even if staff has every permission", () => {
    const all = { ...cashier, permissions: ["pos", "sales", "menu", "setup"] as never };
    expect(canOpen(all, "/team")).toBe(false);
    expect(canOpen(all, "/settings")).toBe(false);
    expect(canOpen({ ...cashier, isOwner: true }, "/team")).toBe(true);
  });
});
