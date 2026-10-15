import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { categories, products, type CategoryId } from "@/data/menuData";
import { useOrder } from "@/components/pos/OrderContext";
import { priceKey } from "@/lib/menuOverrides";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/menu-growth")({
  head: () => ({ meta: [{ title: "Menu Management — Mimi’s Pizza" }, { name: "description", content: "Edit prices and item availability in Mimi’s Pizza POS." }, { property: "og:title", content: "Menu Management — Mimi’s Pizza" }, { property: "og:description", content: "Edit menu prices and mark items unavailable." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MenuManagement,
});

function MenuManagement() {
  const { menuOverrides: o, setMenuOverrides } = useOrder();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const list = useMemo(() => products.filter((p) => (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase())), [q, cat]);

  const setPrice = (key: string, base: number, v: string) => {
    const n = Number(v);
    setMenuOverrides((m) => {
      const prices = { ...m.prices };
      if (!v || !Number.isFinite(n) || n <= 0 || n === base) delete prices[key]; else prices[key] = Math.round(n);
      return { ...m, prices };
    });
  };
  const toggle = (id: string, on: boolean) => setMenuOverrides((m) => ({ ...m, hidden: on ? m.hidden.filter((h) => h !== id) : [...m.hidden, id] }));
  const changed = Object.keys(o.prices).length + o.hidden.length;

  const PriceBox = ({ k, base, label }: { k: string; base: number; label?: string }) => (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label && <span className="w-14 truncate">{label}</span>}
      <span>Rs.</span>
      <Input type="number" min={1} key={`${k}-${o.prices[k] ?? base}`} defaultValue={o.prices[k] ?? base} onBlur={(e) => setPrice(k, base, e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className={`h-8 w-24 text-sm ${o.prices[k] !== undefined ? "border-primary font-semibold" : ""}`} aria-label={`Price ${label ?? ""}`} />
    </label>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-display text-xl font-semibold">Menu Management</h2><p className="text-xs text-muted-foreground">Prices edit karein ya item ko unavailable karein — POS screen par foran apply hota hai. {changed > 0 && <b className="text-primary">{changed} changes</b>}</p></div>
        <Button variant="outline" className="h-9 text-xs" disabled={!changed} onClick={() => setMenuOverrides({ prices: {}, hidden: [] })}><RotateCcw /> Reset all</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item..." className="pl-9" /></div>
        <select value={cat} onChange={(e) => setCat(e.target.value as CategoryId | "all")} className="h-9 rounded-md border bg-background px-3 text-sm">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="divide-y rounded-xl border bg-card">
        {list.map((p) => {
          const on = !o.hidden.includes(p.id);
          return (
            <div key={p.id} className={`flex flex-wrap items-center gap-3 p-3 ${on ? "" : "opacity-55"}`}>
              <div className="min-w-[160px] flex-1"><p className="text-sm font-semibold">{p.name}</p><p className="text-[11px] capitalize text-muted-foreground">{p.category}{p.tag ? ` · ${p.tag}` : ""}{on ? "" : " · Unavailable"}</p></div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {p.price !== undefined && <PriceBox k={priceKey(p.id)} base={p.price} />}
                {p.sizes?.map((s) => <PriceBox key={s.size} k={priceKey(p.id, s.size)} base={s.price} label={s.size} />)}
              </div>
              <label className="flex items-center gap-2 text-xs"><Switch checked={on} onCheckedChange={(v) => toggle(p.id, v)} aria-label={`${p.name} available`} />{on ? "Available" : "Off"}</label>
            </div>
          );
        })}
        {!list.length && <p className="p-6 text-center text-sm text-muted-foreground">No items found.</p>}
      </div>
      <p className="text-[11px] text-muted-foreground">Note: changes page refresh par reset ho jati hain — permanent save Phase 7 mein aayega.</p>
    </div>
  );
}
