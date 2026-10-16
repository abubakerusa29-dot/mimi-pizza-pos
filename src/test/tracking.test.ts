import { describe, it, expect } from "vitest";
import { stageOf } from "@/components/public/OrderTracker";
import { TRACK_URL, isPublicPath } from "@/data/publicSite";

describe("order tracking", () => {
  const t0 = "2026-10-16T10:00:00Z";
  const now = new Date(t0).getTime();
  it("new order is confirmed, then preparing", () => {
    expect(stageOf({ status: null, created_at: t0 }, now)).toBe(0);
    expect(stageOf({ status: null, created_at: t0 }, now + 120_000)).toBe(1);
  });
  it("rider assigned shows on the way; delivered is final", () => {
    expect(stageOf({ status: "On the way", created_at: t0 }, now)).toBe(2);
    expect(stageOf({ status: "Delivered", created_at: t0 }, now)).toBe(3);
  });
  it("QR points to current domain tracking page and public pages skip POS shell", () => {
    expect(TRACK_URL).toBe("https://demo-mimi-pizza.ebpk.site/track");
    expect(isPublicPath("/track")).toBe(true);
    expect(isPublicPath("/pos")).toBe(false); expect(isPublicPath("/")).toBe(true);
  });
});
