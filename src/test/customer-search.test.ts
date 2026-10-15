import { describe, expect, it } from "vitest";
import { findCustomer, searchCustomers } from "@/lib/backOffice";
const list = [{ phone: "1122", name: "Test", address: "Lalamusa", notes: "", area: "Model Town" }];
describe("customer search", () => {
  it("finds a short test phone number", () => expect(findCustomer(list, "1122")?.name).toBe("Test"));
  it("searches by name and area", () => {
    expect(searchCustomers(list, "tes")).toHaveLength(1);
    expect(searchCustomers(list, "model")).toHaveLength(1);
  });
});
