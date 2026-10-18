import { confirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, CheckCircle2, Send, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrder } from "@/components/pos/OrderContext";
import { cartTotals, formatRs } from "@/lib/cart";
import { pendingDispatch, riderSummaries } from "@/lib/riders";

export const Route = createFileRoute("/riders")({
  head: () => ({ meta: [{ title: "Riders & Cash — Mimi’s Pizza" }, { name: "description", content: "Track delivery riders, orders on the way and cash to collect." }, { property: "og:title", content: "Riders & Cash — Mimi’s Pizza" }, { property: "og:description", content: "Delivery rider dispatch and cash settlement for Mimi’s Pizza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Riders,
});

function Riders() {
  const { invoices, setInvoiceStatus, assignRider, riderList } = useOrder();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [pick, setPick] = useState("");
  const pending = pendingDispatch(invoices, query);
  const selectedPending = selected.filter((n) => pending.some((p) => p.orderNo === n));
  const allSelected = pending.length > 0 && selectedPending.length === pending.length;
  const toggle = (n: number) => setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const deliveries = invoices.filter((i) => i.orderType === "Delivery" && i.rider);
  const summaries = riderSummaries(deliveries.map((d) => ({ orderType: d.orderType, rider: d.rider ?? "", status: d.status ?? "Preparing", lines: d.lines })));
  const outstanding = summaries.reduce((s, r) => s + r.cashOutstanding, 0);
  const returned = summaries.reduce((s, r) => s + r.cashReturned, 0);
  /** Owner confirms the rider handed over all cash: every open order of that rider becomes settled. */
  const collect = async (riderName: string, amount: number) => {
    if (!(await confirmDialog(`Did you receive ${formatRs(amount)} from ${riderName}?`, { title: "Confirm cash collected", confirmLabel: "Yes, collected" }))) return;
    deliveries.filter((d) => d.rider === riderName && (d.status ?? "Preparing") !== "Cash returned").forEach((d) => setInvoiceStatus(d.orderNo, "Cash returned"));
    toast.success(`Payment collected from ${riderName}: ${formatRs(amount)}`);
  };
  const onRoad = deliveries.filter((d) => (d.status ?? "Preparing") === "On the way").length;

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

        <h2 className="mt-6 text-sm font-semibold">Dispatch orders</h2>
        <div className="mt-2 rounded-xl border border-border bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoice #, phone or address" className="min-w-[200px] flex-1" aria-label="Search pending invoices" />
            <Button size="sm" variant="outline" disabled={!pending.length} onClick={() => setSelected(allSelected ? [] : pending.map((p) => p.orderNo))}>{allSelected ? "Clear" : "Select all"}</Button>
          </div>
          <div className="mt-3 grid gap-2">
            {pending.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No delivery orders waiting for a rider.</p>}
            {pending.map((d) => (
              <label key={d.orderNo} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${selected.includes(d.orderNo) ? "border-primary bg-accent" : "border-border"}`}>
                <Checkbox checked={selected.includes(d.orderNo)} onCheckedChange={() => toggle(d.orderNo)} aria-label={`Select invoice ${d.orderNo}`} />
                <div className="min-w-0 flex-1"><p className="font-semibold">#{d.orderNo}{d.area ? ` · ${d.area}` : ""}</p><p className="truncate text-xs text-muted-foreground">{d.phone || "No phone"} · {d.address || "No address"}</p></div>
                <span className="font-bold">{formatRs(cartTotals(d.lines).total)}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Choose rider" className="h-9 min-w-[160px] flex-1 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Choose rider…</option>
              {riderList.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <Button disabled={!pick || selectedPending.length === 0} onClick={() => { assignRider(selectedPending, pick); toast.success(`${selectedPending.length} order(s) dispatched with ${pick}`); setSelected([]); }}>
              <Send className="h-4 w-4" /> Dispatch {selectedPending.length || ""} to rider
            </Button>
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">Rider settlement</h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-card">
          {summaries.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No rider has been assigned yet.</p> : (
            <table className="w-full text-sm"><thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-3">Rider</th><th className="p-3">On the way</th><th className="p-3">Delivered</th><th className="p-3">Settled</th><th className="p-3 text-right">Cash outstanding</th><th className="p-3 text-right">Collect</th></tr></thead>
              <tbody>{summaries.map((s) => <tr key={s.rider} className="border-t border-border"><td className="p-3 font-semibold">{s.rider}</td><td className="p-3">{s.active}</td><td className="p-3">{s.delivered}</td><td className="p-3">{s.settled}</td><td className="p-3 text-right font-bold text-primary">{formatRs(s.cashOutstanding)}</td><td className="p-3 text-right">{s.cashOutstanding > 0 ? <Button size="sm" onClick={() => collect(s.rider, s.cashOutstanding)}>Collect {formatRs(s.cashOutstanding)}</Button> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary"><CheckCircle2 className="h-4 w-4" /> Payment collected</span>}</td></tr>)}</tbody></table>
          )}
        </div>

        <h2 className="mt-6 text-sm font-semibold">Delivery orders</h2>
        <div className="mt-2 grid gap-2">
          {deliveries.length === 0 && <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">No delivery orders yet. <Link to="/pos" className="font-semibold text-primary">Take an order</Link></div>}
          {deliveries.map((d) => {
            const status = d.status ?? "Preparing";
            return (
              <div key={d.orderNo} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                <div className="min-w-0 flex-1"><p className="font-semibold">#{d.orderNo} · {d.rider || "No rider"}{d.dispatchedAt ? ` · left ${d.dispatchedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : ""}{d.area ? ` · ${d.area}` : ""}</p><p className="truncate text-xs text-muted-foreground">{d.phone || "No phone"} · {d.address || "No address"}</p></div>
                <span className="font-bold">{formatRs(cartTotals(d.lines).total)}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "Cash returned" ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"}`}>{status}</span>
                {status === "On the way" && <Button size="sm" variant="outline" onClick={() => setInvoiceStatus(d.orderNo, "Delivered")}>Mark delivered</Button>}
                {status !== "Cash returned" && <Button size="sm" onClick={async () => { if (await confirmDialog(`Did you receive ${formatRs(cartTotals(d.lines).total)} from ${d.rider || "the rider"} for order #${d.orderNo}?`, { title: "Confirm cash collected", confirmLabel: "Yes, collected" })) setInvoiceStatus(d.orderNo, "Cash returned"); }}>Payment collected</Button>}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
