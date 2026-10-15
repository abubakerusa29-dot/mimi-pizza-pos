import { cartTotals, type CartLine } from "@/lib/cart";

export interface SaleRecord { date: Date; orderType: string; lines: CartLine[] }

/** Sales summary for invoices whose date falls between from and to (inclusive days). */
export function salesSummary(invoices: SaleRecord[], from?: Date, to?: Date) {
  const start = from ? new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime() : -Infinity;
  const end = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1).getTime() : Infinity;
  const rows = invoices.filter((i) => i.date.getTime() >= start && i.date.getTime() < end);
  const revenue = rows.reduce((s, i) => s + cartTotals(i.lines).total, 0);
  const byType: Record<string, { orders: number; revenue: number }> = {};
  const items: Record<string, { qty: number; revenue: number }> = {};
  const hours: Record<number, number> = {};
  for (const i of rows) {
    const t = (byType[i.orderType] ??= { orders: 0, revenue: 0 });
    t.orders += 1;
    t.revenue += cartTotals(i.lines).total;
    hours[i.date.getHours()] = (hours[i.date.getHours()] ?? 0) + 1;
    for (const l of i.lines) {
      const it = (items[l.name] ??= { qty: 0, revenue: 0 });
      it.qty += l.qty;
      it.revenue += l.unitPrice * l.qty;
    }
  }
  const topItems = Object.entries(items).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty || b.revenue - a.revenue);
  const peakHours = Object.entries(hours).map(([h, orders]) => ({ hour: Number(h), orders })).sort((a, b) => a.hour - b.hour);
  return { orders: rows.length, revenue, average: rows.length ? Math.round(revenue / rows.length) : 0, byType, topItems, peakHours };
}
