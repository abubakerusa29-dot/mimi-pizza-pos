import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus, Trash2, TriangleAlert } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isLowStock, newId, type StockItem } from "@/lib/backOffice";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory | Mimi’s Pizza POS" }, { name: "description", content: "Track packing material like pizza boxes, bags and wrappers." }, { property: "og:title", content: "Inventory | Mimi’s Pizza POS" }, { property: "og:description", content: "Packing material stock with low stock alerts." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { backOffice, updateBackOffice } = useOrder();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [qty, setQty] = useState("0");
  const [lowAt, setLowAt] = useState("20");
  const [moveBy, setMoveBy] = useState<Record<string, string>>({});
  const stock = backOffice.stock;
  const set = (s: StockItem[]) => updateBackOffice({ stock: s });
  const add = () => {
    if (!name.trim()) return;
    set([...stock, { id: newId(), name: name.trim(), unit: unit.trim() || "pcs", qty: Number(qty) || 0, lowAt: Number(lowAt) || 0 }]);
    setName(""); setQty("0");
  };
  const move = (id: string, sign: 1 | -1) => {
    const n = Number(moveBy[id] ?? 1) || 0;
    set(stock.map((s) => (s.id === id ? { ...s, qty: Math.max(0, s.qty + sign * n) } : s)));
  };
  const low = stock.filter(isLowStock);
  return (
    <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      <div><h2 className="font-display text-xl font-semibold">Inventory</h2><p className="text-xs text-muted-foreground">Optional. Keep count of packing material such as pizza boxes, bags and wrappers. Add stock when it arrives and use stock when you count what was used.</p></div>
      {low.length > 0 && <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm"><TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" /><span><b>Low stock:</b> {low.map((s) => s.name).join(", ")}</span></div>}
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Add an item</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_80px_90px_110px_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item, e.g. Medium pizza box" aria-label="Item name" />
          <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" aria-label="Unit" />
          <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" min={0} aria-label="Quantity" title="Quantity now" />
          <Input value={lowAt} onChange={(e) => setLowAt(e.target.value)} type="number" min={0} aria-label="Alert below" title="Alert when stock reaches" />
          <Button onClick={add}><Plus /> Add</Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Last box is the alert level. You get a warning when stock drops to this number.</p>
      </section>
      <div className="grid gap-2">
        {stock.map((s) => (
          <div key={s.id} className={`grid items-center gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_auto] ${isLowStock(s) ? "border-destructive/40 bg-destructive/5" : "bg-card"}`}>
            <div><p className="text-sm font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">In stock: <b className={isLowStock(s) ? "text-destructive" : "text-foreground"}>{s.qty} {s.unit}</b> · alert at {s.lowAt}</p></div>
            <div className="flex items-center gap-2">
              <Input value={moveBy[s.id] ?? "1"} onChange={(e) => setMoveBy({ ...moveBy, [s.id]: e.target.value })} type="number" min={0} className="w-20" aria-label={`Amount for ${s.name}`} />
              <Button size="sm" variant="outline" onClick={() => move(s.id, 1)}><Plus /> Add</Button>
              <Button size="sm" variant="outline" onClick={() => move(s.id, -1)}><Minus /> Use</Button>
              <button onClick={() => { if (window.confirm(`Delete ${s.name}?`)) set(stock.filter((x) => x.id !== s.id)); }} aria-label={`Delete ${s.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
