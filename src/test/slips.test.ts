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

import { dealParts } from "@/components/pos/ReceiptPreview";
describe("kitchen slip deal breakdown", () => {
  it("lists every item inside a deal", () =>
    expect(dealParts({ key: "deal-2|Cheese Lover", description: "Regular Small Pizza, Creamy Pasta (Half), Chicken Paratha Roll, 500 ml Drink" }))
      .toEqual(["Regular Small Pizza", "Creamy Pasta (Half)", "Chicken Paratha Roll", "500 ml Drink"]));
  it("non-deal items get no breakdown", () => expect(dealParts({ key: "pz-bbq|Large", description: "Dip sauce, onion" })).toEqual([]));
});
