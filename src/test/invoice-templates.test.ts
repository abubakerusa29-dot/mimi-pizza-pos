import { describe, expect, it } from "vitest";
import { normalizeInvoiceSettings, templates } from "@/lib/invoiceTemplates";

describe("invoice templates", () => {
  it("offers seven built-in templates", () => expect(templates).toHaveLength(7));
  it("defaults to 80mm paper and only allows 80 or 58", () => {
    expect(normalizeInvoiceSettings(undefined).paper).toBe("80");
    expect(normalizeInvoiceSettings({ paper: "58" }).paper).toBe("58");
    expect(normalizeInvoiceSettings({ paper: "110" }).paper).toBe("80");
  });
  it("has no setting that can hide the software credit", () => {
    expect(Object.keys(normalizeInvoiceSettings({ hideCredit: true }))).not.toContain("hideCredit");
  });
});
