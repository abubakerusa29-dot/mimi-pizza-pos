import { describe, it, expect } from "vitest";
import { riderSummaries } from "@/lib/riders";
const line = (price: number) => [{ key: "a", id: "a", name: "A", unitPrice: price, qty: 1 }] as never;

describe("rider cash", () => {
  it("keeps cash outstanding until marked returned", () => {
    const [s] = riderSummaries([
      { orderType: "Delivery", rider: "R", status: "On the way", lines: line(1000) },
      { orderType: "Delivery", rider: "R", status: "Delivered", lines: line(500) },
      { orderType: "Delivery", rider: "R", status: "Cash returned", lines: line(300) },
    ]);
    expect(s.cashOutstanding).toBe(1500);
    expect(s.cashReturned).toBe(300);
    expect([s.active, s.delivered, s.settled]).toEqual([1, 1, 1]);
  });
  it("ignores non-delivery orders", () => {
    expect(riderSummaries([{ orderType: "Takeaway", rider: "R", status: "On the way", lines: line(100) }])).toEqual([]);
  });
});
