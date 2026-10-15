import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, RotateCcw, Plus, Trash2, ImagePlus, X } from "lucide-react";
import { categories, products, type CategoryId } from "@/data/menuData";
import { useOrder } from "@/components/pos/OrderContext";
import { priceKey, fullMenu, makeCustomItem } from "@/lib/menuOverrides";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/menu-growth")({
  head: () => ({ meta: [{ title: "Menu Management — Mimi’s Pizza" }, { name: "description", content: "Add new items, edit prices and item availability in Mimi’s Pizza POS." }, { property: "og:title", content: "Menu Management — Mimi’s Pizza" }, { property: "og:description", content: "Add menu items, edit prices and mark items unavailable." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MenuManagement,
});

/** Shrinks an uploaded photo to a small JPEG data URL so it can be saved with settings. */
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 480 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const blank = { name: "", category: "pizza" as CategoryId, description: "", price: "", sizes: "" };

function MenuManagement() {
  const { menuOverrides: o, setMenuOverrides } = useOrder();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blank);
  const [photo, setPhoto] = useState<string>("");
  const [err, setErr] = useState("");
  const customIds = new Set((o.custom ?? []).map((p) => p.id));
  const list = useMemo(() => fullMenu(products, o).filter((p) => (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase())), [q, cat, o]);

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

  const save = () => {
    const item = makeCustomItem(form, `custom-${Date.now().toString(36)}`);
    if (!item) { setErr("Naam aur price (ya sizes) zaroori hain."); return; }
    setMenuOverrides((m) => ({ ...m, custom: [...(m.custom ?? []), item], images: photo ? { ...(m.images ?? {}), [item.id]: photo } : (m.images ?? {}) }));
    setForm(blank); setPhoto(""); setErr(""); setAdding(false);
  };
  const remove = (id: string) => {
    if (!confirm("Yeh item menu se delete karein?")) return;
    setMenuOverrides((m) => { const images = { ...(m.images ?? {}) }; delete images[id]; return { ...m, custom: (m.custom ?? []).filter((p) => p.id !== id), images, hidden: m.hidden.filter((h) => h !== id) }; });
  };

  const PriceBox = ({ k, base, label }: { k: string; base: number; label?: string }) => (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label && <span className="w-14 truncate">{label}</span>}
      <span>Rs.</span>
      <Input type="number" min={1} key={`${k}-${o.prices[k] ?? base}`} defaultValue={o.prices[k] ?? base} onBlur={(e) => setPrice(k, base, e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className={`h-8 w-24 text-sm ${o.prices[k] !== undefined ? "border-primary font-semibold" : ""}`} aria-label={`Price ${label ?? ""}`} />
    </label>
  );

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-display text-xl font-semibold">Menu Management</h2><p className="text-xs text-muted-foreground">Naye items add karein, prices edit karein ya item unavailable karein — POS screen par foran apply hota hai. {changed > 0 && <b className="text-primary">{changed} changes</b>}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 text-xs" disabled={!changed} onClick={() => setMenuOverrides((m) => ({ ...m, prices: {}, hidden: [] }))}><RotateCcw /> Reset prices</Button>
          <Button className="h-9 text-xs" onClick={() => setAdding(!adding)}>{adding ? <X /> : <Plus />} {adding ? "Close" : "Add new item"}</Button>
        </div>
      </div>

      {adding && (
        <section className="space-y-3 rounded-xl border border-primary/40 bg-card p-4">
          <h3 className="text-sm font-semibold">New menu item</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">Item name *<Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chicken Fajita Burger" className="text-sm" /></label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CategoryId })} className="h-9 rounded-md border bg-background px-3 text-sm text-foreground">
                {categories.filter((c) => c.id !== "all").map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground sm:col-span-2">Short description / included items<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="e.g. 1 Medium pizza + 1 burger + 1.5L drink" className="rounded-md border bg-background px-3 py-2 text-sm text-foreground" /></label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">Price (Rs.) — single price item<Input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 850" className="text-sm" /></label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">Ya sizes (optional)<Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Small:650, Medium:1200, Large:1600" className="text-sm" /></label>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed p-3">
            <div className="grid size-20 place-items-center overflow-hidden rounded-md border bg-background">{photo ? <img src={photo} alt="Preview" className="h-full w-full object-contain" /> : <ImagePlus className="text-muted-foreground" />}</div>
            <div className="min-w-[200px] flex-1 space-y-1.5">
              <p className="text-xs font-semibold">Product photo</p>
              <p className="text-[11px] text-muted-foreground">⚠️ Photo ka background <b>white (safaid)</b> hona chahiye — sirf product nazar aaye, square photo behtar hai. Photo generate karwate waqt bhi "on a plain white background" likhein.</p>
              <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await compress(f)); }} className="text-xs" aria-label="Upload product photo" />
            </div>
          </div>
          {err && <p className="text-xs font-medium text-destructive">{err}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setAdding(false); setErr(""); }}>Cancel</Button><Button onClick={save}><Plus /> Save item</Button></div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item..." className="pl-9" /></div>
        <select value={cat} onChange={(e) => setCat(e.target.value as CategoryId | "all")} className="h-9 rounded-md border bg-background px-3 text-sm">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="divide-y rounded-xl border bg-card">
        {list.map((p) => {
          const on = !o.hidden.includes(p.id);
          const mine = customIds.has(p.id);
          return (
            <div key={p.id} className={`flex flex-wrap items-center gap-3 p-3 ${on ? "" : "opacity-55"}`}>
              <div className="min-w-[160px] flex-1"><p className="text-sm font-semibold">{p.name}{mine && <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">NEW</span>}</p><p className="text-[11px] capitalize text-muted-foreground">{p.category}{p.tag ? ` · ${p.tag}` : ""}{on ? "" : " · Unavailable"}</p></div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {p.price !== undefined && <PriceBox k={priceKey(p.id)} base={p.price} />}
                {p.sizes?.map((s) => <PriceBox key={s.size} k={priceKey(p.id, s.size)} base={s.price} label={s.size} />)}
              </div>
              <label className="flex items-center gap-2 text-xs"><Switch checked={on} onCheckedChange={(v) => toggle(p.id, v)} aria-label={`${p.name} available`} />{on ? "Available" : "Off"}</label>
              {mine && <Button variant="ghost" size="icon" onClick={() => remove(p.id)} aria-label={`Delete ${p.name}`}><Trash2 className="text-destructive" /></Button>}
            </div>
          );
        })}
        {!list.length && <p className="p-6 text-center text-sm text-muted-foreground">No items found.</p>}
      </div>
    </div>
    </main>
  );
}
