import { describe, expect, it } from "vitest";
import { slipsFor } from "@/components/pos/ReceiptPreview";
import { softwareCredit } from "@/data/softwareCredit";

describe("print slips per order type", () => {
  it("dine-in prints kitchen + customer", () => expect(slipsFor("Dine-in")).toEqual(["kitchen", "customer"]));
  it("takeaway prints kitchen + customer", () => expect(slipsFor("Takeaway")).toEqual(["kitchen", "customer"]));
  it("delivery prints kitchen + customer + rider", () => expect(slipsFor("Delivery")).toEqual(["kitchen", "customer", "rider"]));
  it("software credit uses Ecom Builder details", () => {
    expect(softwareCredit.website).toBe("https://ecombuilder.site/");
    expect(softwareCredit.phone).toBe("03426313348");
  });
});
