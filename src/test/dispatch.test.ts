import { describe, expect, it } from "vitest";
import { pendingDispatch } from "@/lib/riders";

const inv = (orderNo: number, orderType: string, rider?: string, address = "") => ({ orderNo, orderType, rider, phone: "0300", address });
describe("pendingDispatch", () => {
  const list = [inv(1001, "Delivery"), inv(1002, "Delivery", "Rider Test 1"), inv(1003, "Takeaway"), inv(1004, "Delivery", undefined, "Gulberg")];
  it("lists only delivery invoices without a rider", () => {
    expect(pendingDispatch(list).map((i) => i.orderNo)).toEqual([1001, 1004]);
  });
  it("searches by invoice number or address", () => {
    expect(pendingDispatch(list, "#1001").map((i) => i.orderNo)).toEqual([1001]);
    expect(pendingDispatch(list, "gulberg").map((i) => i.orderNo)).toEqual([1004]);
  });
});
