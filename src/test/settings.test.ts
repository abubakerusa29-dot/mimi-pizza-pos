import { describe, expect, it } from "vitest";
import { restaurantInfo } from "@/data/menuData";
import { riders, deliveryAreas } from "@/data/riders";
import { futureFeatures } from "@/data/futureFeatures";

describe("settings defaults", () => {
  it("keeps the real restaurant profile as the receipt default", () => {
    expect(restaurantInfo.phone).toBe("0312-4607733");
    expect(restaurantInfo.address).toContain("Lalamusa");
  });
  it("starts with test riders and areas the owner can replace", () => {
    expect(riders.length).toBeGreaterThan(0);
    expect(deliveryAreas).toContain("Other");
  });
  it("no longer lists Settings as a coming-soon feature", () => {
    expect(futureFeatures.some((f) => f.slug === "settings")).toBe(false);
  });
});
