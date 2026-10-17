import { describe, expect, it } from "vitest";
import { customerWhatsAppLink, toWhatsAppNumber, trackingMessage } from "./whatsappInvoice";

describe("customer WhatsApp tracking message", () => {
  it("converts local 03xx numbers to 92 format", () => {
    expect(toWhatsAppNumber("0301-5551234")).toBe("923015551234");
    expect(toWhatsAppNumber("+92 301 5551234")).toBe("923015551234");
  });
  it("rejects numbers that are not Pakistani mobiles", () => {
    expect(customerWhatsAppLink("1122", "hi")).toBe("");
  });
  it("includes the invoice number and tracking link", () => {
    const m = trackingMessage({ orderNo: 1001, total: 1460 });
    expect(m).toContain("#1001");
    expect(m).toContain("/track?id=1001");
  });
});
