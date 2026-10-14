import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/components/pos/OrderContext";
import { cartTotals, formatRs } from "@/lib/cart";
import { riderSummaries } from "@/lib/riders";

export const Route = createFileRoute("/riders")({
  head: () => ({ meta: [{ title: "Riders & Cash — Mimi’s Pizza" }, { name: "description", content: "Track delivery riders, orders on the way and cash to collect." }, { property: "og:title", content: "Riders & Cash — Mimi’s Pizza" }, { property: "og:description", content: "Delivery rider dispatch and cash settlement for Mimi’s Pizza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Riders,
});

function Riders() {
  const { invoices, setInvoiceStatus } = useOrder();
  const deliveries = invoices.filter((i) => i.orderType === "Delivery");
  const summaries = riderSummaries(deliveries.map((d) => ({ orderType: d.orderType, rider: d.rider ?? "", status: d.status ?? "On the way", lines: d.lines })));
  const outstanding = summaries.reduce((s, r) => s + r.cashOutstanding, 0);
  const returned = summaries.reduce((s, r) => s + r.cashReturned, 0);
  const onRoad = deliveries.filter((d) => (d.status ?? "On the way") === "On the way").length;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-semibold">Riders & Cash</h1>
        <p className="mt-1 text-sm text-muted-foreground">Delivery orders printed in this session</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[{ l: "On the way", v: String(onRoad), I: Bike }, { l: "Cash with riders", v: formatRs(outstanding), I: Wallet }, { l: "Cash returned", v: formatRs(returned), I: CheckCircle2 }].map(({ l, v, I }) => (
            <div key={l} className="rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><I className="h-4 w-4 text-primary" />{l}</div><p className="mt-2 text-xl font-bold">{v}</p></div>
          ))}
        </div>

        <h2 className="mt-6 text-sm font-semibold">Rider settlement</h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-card">
          {summaries.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No rider has been assigned yet.</p> : (
            <table className="w-full text-sm"><thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">Rider</th><th className="p-3">On the way</th><th className="p-3">Delivered</th><th className="p-3">Settled</th><th className="p-3 text-right">Cash outstanding</th></tr></thead>
              <tbody>{summaries.map((s) => <tr key={s.rider} className="border-t border-border"><td className="p-3 font-semibold">{s.rider}</td><td className="p-3">{s.active}</td><td className="p-3">{s.delivered}</td><td className="p-3">{s.settled}</td><td className="p-3 text-right font-bold text-primary">{formatRs(s.cashOutstanding)}</td></tr>)}</tbody></table>
          )}
        </div>

        <h2 className="mt-6 text-sm font-semibold">Delivery orders</h2>
        <div className="mt-2 grid gap-2">
          {deliveries.length === 0 && <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">No delivery orders yet. <Link to="/" className="font-semibold text-primary">Take an order</Link></div>}
          {deliveries.map((d) => {
            const status = d.status ?? "On the way";
            return (
              <div key={d.orderNo} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="min-w-0 flex-1"><p className="font-semibold">#{d.orderNo} · {d.rider || "No rider"}{d.area ? ` · ${d.area}` : ""}</p><p className="truncate text-xs text-muted-foreground">{d.phone || "No phone"} · {d.address || "No address"}</p></div>
                <span className="font-bold">{formatRs(cartTotals(d.lines).total)}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "Cash returned" ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"}`}>{status}</span>
                {status === "On the way" && <Button size="sm" variant="outline" onClick={() => setInvoiceStatus(d.orderNo, "Delivered")}>Mark delivered</Button>}
                {status === "Delivered" && <Button size="sm" onClick={() => setInvoiceStatus(d.orderNo, "Cash returned")}>Cash returned</Button>}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
