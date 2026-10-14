import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder, type Invoice, type OrderType } from "@/components/pos/OrderContext";
import { ReceiptPreview } from "@/components/pos/ReceiptPreview";
import { cartTotals, formatRs } from "@/lib/cart";

export const Route = createFileRoute("/invoices")({
  head: () => ({ meta: [{ title: "Previous Invoices — Mimi’s Pizza" }, { name: "description", content: "Search and reprint previous invoices at Mimi’s Pizza." }, { property: "og:title", content: "Previous Invoices — Mimi’s Pizza" }, { property: "og:description", content: "Search and reprint previous Mimi’s Pizza invoices." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Invoices,
});

const filters = ["All", "Dine-in", "Takeaway", "Delivery"] as const;

function Invoices() {
  const { invoices } = useOrder();
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof filters)[number]>("All");
  const [reprint, setReprint] = useState<Invoice | null>(null);
  const rows = useMemo(() => invoices.filter((i) => (type === "All" || i.orderType === (type as OrderType)) && (!q.trim() || `${i.orderNo} ${i.phone}`.includes(q.trim()))), [invoices, q, type]);
  const total = rows.reduce((s, i) => s + cartTotals(i.lines).total, 0);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-semibold">Previous Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bills printed in this session · {rows.length} invoices · {formatRs(total)}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order # or phone" className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm" />
          </label>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {filters.map((f) => <button key={f} onClick={() => setType(f)} className={`h-8 rounded-md px-3 text-xs font-semibold ${type === f ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>{f}</button>)}
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-12 text-center text-muted-foreground"><History className="h-8 w-8" /><p className="text-sm">No invoices yet. Printed bills will appear here.</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">Order #</th><th className="p-3">Time</th><th className="p-3">Type</th><th className="hidden p-3 sm:table-cell">Items</th><th className="p-3 text-right">Total</th><th className="p-3" /></tr></thead>
              <tbody>
                {rows.map((i) => {
                  const t = cartTotals(i.lines);
                  return (
                    <tr key={i.orderNo} className="border-t border-border">
                      <td className="p-3 font-semibold">#{i.orderNo}</td>
                      <td className="p-3">{i.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="p-3">{i.orderType}{i.table ? ` · T${i.table}` : ""}</td>
                      <td className="hidden p-3 sm:table-cell">{t.items}</td>
                      <td className="p-3 text-right font-semibold">{formatRs(t.total)}</td>
                      <td className="p-3 text-right"><Button size="sm" variant="outline" onClick={() => setReprint(i)}><Printer className="h-4 w-4" /> Reprint</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {reprint && <ReceiptPreview open {...reprint} onBack={() => setReprint(null)} />}
    </main>
  );
}
