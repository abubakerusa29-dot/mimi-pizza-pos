import { cartTotals, type CartLine } from "@/lib/cart";

export type DeliveryStatus = "On the way" | "Delivered" | "Cash returned";
export interface DeliveryRecord { orderType: string; rider: string; status: DeliveryStatus; lines: CartLine[] }
export interface RiderSummary { rider: string; active: number; delivered: number; settled: number; cashOutstanding: number; cashReturned: number }

/** Cash is outstanding with a rider until the owner marks it returned. */
export function riderSummaries(records: DeliveryRecord[]): RiderSummary[] {
  const map = new Map<string, RiderSummary>();
  for (const r of records) {
    if (r.orderType !== "Delivery" || !r.rider) continue;
    const s = map.get(r.rider) ?? { rider: r.rider, active: 0, delivered: 0, settled: 0, cashOutstanding: 0, cashReturned: 0 };
    const total = cartTotals(r.lines).total;
    if (r.status === "On the way") s.active++;
    if (r.status === "Delivered") s.delivered++;
    if (r.status === "Cash returned") { s.settled++; s.cashReturned += total; } else s.cashOutstanding += total;
    map.set(r.rider, s);
  }
  return [...map.values()];
}
