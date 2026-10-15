import { describe, expect, it } from "vitest";
import { normalizeTables, occupiedTables, tableLabel } from "@/lib/tables";

describe("tables", () => {
  it("labels a table with its section", () => {
    expect(tableLabel({ name: "Table 3", section: "Family Hall", seats: 6 })).toBe("Table 3 (Family Hall)");
  });
  it("drops unnamed tables and keeps seats at least 1", () => {
    expect(normalizeTables([{ name: "", section: "", seats: 2 }, { name: "T1", section: "", seats: 0 }])).toEqual([{ name: "T1", section: "", seats: 1 }]);
  });
  it("marks today's open dine-in orders as occupied and closed ones as free", () => {
    const now = new Date("2026-10-15T12:00:00");
    const set = occupiedTables([
      { orderType: "Dine-in", table: "Table 1", date: now },
      { orderType: "Dine-in", table: "Table 2", date: now, status: "Delivered" },
      { orderType: "Dine-in", table: "Table 3", date: new Date("2026-10-14T12:00:00") },
    ], now);
    expect([...set]).toEqual(["Table 1"]);
  });
});
