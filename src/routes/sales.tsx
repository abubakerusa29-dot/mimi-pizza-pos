import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/components/pos/OrderContext";
import { formatRs } from "@/lib/cart";
import { salesSummary } from "@/lib/sales";

export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [{ title: "Overall Sales — Mimi’s Pizza" }, { name: "description", content: "Daily sales, best sellers and order types for Mimi’s Pizza." }, { property: "og:title", content: "Overall Sales — Mimi’s Pizza" }, { property: "og:description", content: "Sales report for Mimi’s Pizza POS." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Sales,
});

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y!, m! - 1, d); };

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Downloads the sales report as a Word file that opens in MS Word / WPS / Google Docs. */
function saveWord(s: ReturnType<typeof salesSummary>, from: string, to: string) {
  const range = from || to ? `${from || "start"} to ${to || "today"}` : "All time";
  const td = "border:1px solid #999;padding:6px";
  const rows = (r: string[][]) => r.map((c) => `<tr>${c.map((x) => `<td style="${td}">${esc(x)}</td>`).join("")}</tr>`).join("");
  const html = `<html><head><meta charset="utf-8"><title>Sales Report</title></head><body style="font-family:Arial">
<h1>Mimi's Pizza - Sales Report</h1><p>Period: ${esc(range)}</p>
<table style="border-collapse:collapse">${rows([["Total sales", formatRs(s.revenue)], ["Orders", String(s.orders)], ["Average bill", formatRs(s.average)]])}</table>
<h2>By order type</h2><table style="border-collapse:collapse">${rows([["Type", "Orders", "Sales"], ...(["Dine-in", "Takeaway", "Delivery"] as const).map((t) => [t, String(s.byType[t]?.orders ?? 0), formatRs(s.byType[t]?.revenue ?? 0)])])}</table>
<h2>Busy hours</h2><table style="border-collapse:collapse">${rows([["Hour", "Orders"], ...s.peakHours.map((h) => [`${String(h.hour).padStart(2, "0")}:00`, String(h.orders)])])}</table>
<h2>Best sellers</h2><table style="border-collapse:collapse">${rows([["#", "Item", "Sold", "Sales"], ...s.topItems.slice(0, 20).map((i, n) => [String(n + 1), i.name, String(i.qty), formatRs(i.revenue)])])}</table>
</body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mimis-sales-${from || "all"}${to && to !== from ? `-to-${to}` : ""}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function Sales() {
  const { invoices } = useOrder();
  const today = iso(new Date());
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const s = useMemo(() => salesSummary(invoices, from ? parse(from) : undefined, to ? parse(to) : undefined), [invoices, from, to]);
  const maxHour = Math.max(1, ...s.peakHours.map((h) => h.orders));
  const card = "rounded-xl border bg-card p-4";

  return (
    <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 print:overflow-visible">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">Overall Sales</h1>
            <p className="mt-1 text-sm text-muted-foreground">Based on bills printed in this session.</p>
          </div>
          <div className="flex flex-wrap items-end gap-2 print:hidden">
            <label className="text-xs font-medium">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded-md border bg-background px-2 py-1.5 text-sm" /></label>
            <label className="text-xs font-medium">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded-md border bg-background px-2 py-1.5 text-sm" /></label>
            <Button variant="outline" onClick={() => { setFrom(""); setTo(""); }}>All time</Button>
            <Button variant="outline" onClick={() => window.print()}>Save as PDF</Button>
            <Button onClick={() => saveWord(s, from, to)}>Save as Word</Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[["Total sales", formatRs(s.revenue)], ["Orders", String(s.orders)], ["Average bill", formatRs(s.average)]].map(([k, v]) => (
            <div key={k} className={card}><p className="text-sm text-muted-foreground">{k}</p><p className="mt-1 font-display text-2xl font-bold">{v}</p></div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <section className={card}>
            <h2 className="font-semibold">By order type</h2>
            {(["Dine-in", "Takeaway", "Delivery"] as const).map((t) => (
              <div key={t} className="mt-3 flex justify-between text-sm"><span>{t} · {s.byType[t]?.orders ?? 0} orders</span><span className="font-semibold">{formatRs(s.byType[t]?.revenue ?? 0)}</span></div>
            ))}
          </section>
          <section className={card}>
            <h2 className="font-semibold">Busy hours</h2>
            {s.peakHours.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>}
            {s.peakHours.map((h) => (
              <div key={h.hour} className="mt-2 flex items-center gap-2 text-sm">
                <span className="w-14 shrink-0">{String(h.hour).padStart(2, "0")}:00</span>
                <div className="h-3 rounded bg-primary" style={{ width: `${(h.orders / maxHour) * 100}%` }} />
                <span>{h.orders}</span>
              </div>
            ))}
          </section>
        </div>

        <section className={`${card} mt-3`}>
          <h2 className="font-semibold">Best sellers</h2>
          {s.topItems.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Print a bill from Point of Sale to see sales here.</p>}
          <table className="mt-2 w-full text-sm">
            <tbody>
              {s.topItems.slice(0, 10).map((i, n) => (
                <tr key={i.name} className="border-t"><td className="py-2 pr-2 text-muted-foreground">{n + 1}</td><td className="py-2">{i.name}</td><td className="py-2 text-right">{i.qty} sold</td><td className="py-2 text-right font-semibold">{formatRs(i.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
