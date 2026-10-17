import { describe, expect, it } from "vitest";
import { ratingSummary } from "@/lib/reviews";

describe("review rating", () => {
  it("starts at 4.5 from 305 reviews", () => {
    expect(ratingSummary([])).toEqual({ average: 4.5, count: 305 });
  });
  it("updates with new customer reviews", () => {
    const s = ratingSummary(Array(305).fill(5));
    expect(s).toEqual({ average: 4.8, count: 610 });
  });
});
