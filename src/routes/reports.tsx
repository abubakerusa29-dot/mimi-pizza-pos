import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRs } from "@/lib/cart";
import { salesSummary } from "@/lib/sales";
import { isLowStock, profitReport } from "@/lib/backOffice";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports | Mimi’s Pizza POS" }, { name: "description", content: "Sales, expenses and profit report for any date range." }, { property: "og:title", content: "Reports | Mimi’s Pizza POS" }, { property: "og:description", content: "Profit and expense reports for Mimi’s Pizza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ReportsPage,
});

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y!, m! - 1, d); };

function ReportsPage() {
  const { invoices, backOffice } = useOrder();
  const now = new Date();
  const [from, setFrom] = useState(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(iso(now));
  const p = useMemo(() => profitReport(invoices, backOffice.expenses, from, to), [invoices, backOffice.expenses, from, to]);
  const s = useMemo(() => salesSummary(invoices, from ? parse(from) : undefined, to ? parse(to) : undefined), [invoices, from, to]);
  const preset = (days: number) => { const f = new Date(); f.setDate(f.getDate() - days); setFrom(iso(f)); setTo(iso(new Date())); };
  const card = (label: string, value: string, tone = "") => <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p></div>;
  return (
    <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><h2 className="font-display text-xl font-semibold">Reports</h2><p className="text-xs text-muted-foreground">Sales minus expenses for the dates you pick.</p></div>
        <Button variant="outline" onClick={() => window.print()}><Printer /> Print report</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" aria-label="From" />
        <span className="text-sm">to</span>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" aria-label="To" />
        <Button size="sm" variant="ghost" onClick={() => preset(0)}>Today</Button>
        <Button size="sm" variant="ghost" onClick={() => preset(6)}>Last 7 days</Button>
        <Button size="sm" variant="ghost" onClick={() => preset(29)}>Last 30 days</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {card("Sales", formatRs(p.sales))}
        {card("Expenses", formatRs(p.spent), "text-destructive")}
        {card(p.profit >= 0 ? "Profit" : "Loss", formatRs(Math.abs(p.profit)), p.profit >= 0 ? "text-primary" : "text-destructive")}
        {card("Orders", String(s.orders))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-card p-4"><h3 className="text-sm font-semibold">Expenses by type</h3>
          {Object.keys(p.byType).length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No expenses in these dates.</p> :
            <ul className="mt-2 space-y-1 text-sm">{Object.entries(p.byType).sort((a, b) => b[1] - a[1]).map(([t, v]) => <li key={t} className="flex justify-between"><span>{t}</span><b>{formatRs(v)}</b></li>)}</ul>}
        </section>
        <section className="rounded-xl border bg-card p-4"><h3 className="text-sm font-semibold">Best sellers</h3>
          {s.topItems.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No sales in these dates.</p> :
            <ul className="mt-2 space-y-1 text-sm">{s.topItems.slice(0, 8).map((b) => <li key={b.name} className="flex justify-between"><span>{b.name} × {b.qty}</span><b>{formatRs(b.revenue)}</b></li>)}</ul>}
        </section>
        <section className="rounded-xl border bg-card p-4 md:col-span-2"><h3 className="text-sm font-semibold">Packing stock</h3>
          <p className="mt-2 text-sm">{backOffice.stock.filter(isLowStock).length} of {backOffice.stock.length} items are low on stock.</p>
        </section>
      </div>
    </div>
  );
}
