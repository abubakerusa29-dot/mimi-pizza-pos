import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, RotateCcw, Plus, Trash2, ImagePlus, X } from "lucide-react";
import { categories, products, type CategoryId } from "@/data/menuData";
import { useOrder } from "@/components/pos/OrderContext";
import { priceKey, fullMenu, makeCustomItem } from "@/lib/menuOverrides";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { productImages } from "@/data/productImages";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
const SIZE_NAMES = ["Small", "Medium", "Large", "Family"] as const;
type SizeRow = { on: boolean; price: string };
const blankSizes = (): Record<string, SizeRow> => Object.fromEntries(SIZE_NAMES.map((n) => [n, { on: true, price: "" } as SizeRow]));
const DEAL_PARTS: { id: CategoryId; label: string }[] = [
  { id: "pizza", label: "Pizza" }, { id: "burgers", label: "Burger" }, { id: "drinks", label: "Drink" }, { id: "wings", label: "Wings" },
  { id: "sides", label: "Fries / Side" }, { id: "pasta", label: "Pasta" }, { id: "rolls", label: "Roll / Paratha" },
];

function MenuManagement() {
  const { menuOverrides: o, setMenuOverrides } = useOrder();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blank);
  const [photo, setPhoto] = useState<string>("");
  const [err, setErr] = useState("");
  const [sizeRows, setSizeRows] = useState(blankSizes);
  const [part, setPart] = useState<{ cat: CategoryId; qty: string; size: string; mode: "any" | "specific"; pick: string; q: string }>({ cat: "pizza", qty: "1", size: "Medium", mode: "any", pick: "", q: "" });
  const [del, setDel] = useState<{ id: string; name: string; regular: boolean; step: 1 | 2 } | null>(null);
  const menuAll = fullMenu(products, o);
  const partOptions = menuAll.filter((p) => p.category === part.cat && p.name.toLowerCase().includes(part.q.trim().toLowerCase()));
  const addPart = () => {
    const qty = Math.max(1, Number(part.qty) || 1);
    const picked = menuAll.find((p) => p.id === part.pick);
    const label = DEAL_PARTS.find((d) => d.id === part.cat)!.label;
    let text: string;
    if (part.mode === "specific" && picked) text = picked.name;
    else if (part.cat === "pizza") text = "Regular Pizza (any regular flavour)";
    else text = `${label} (any)`;
    if (part.cat === "pizza") text = `${part.size} ${text}`;
    const line = `${qty > 1 ? `${qty} × ` : ""}${text}`;
    setForm((f) => ({ ...f, description: f.description.trim() ? `${f.description.trim()}, ${line}` : line }));
    setPart((x) => ({ ...x, pick: "", q: "" }));
  };
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
    const sizes = form.category === "pizza" ? SIZE_NAMES.filter((n) => sizeRows[n]!.on && Number(sizeRows[n]!.price) > 0).map((n) => `${n}:${sizeRows[n]!.price}`).join(", ") : "";
    if (form.category === "pizza" && !sizes) { setErr("Kam az kam ek available size ki price likhein."); return; }
    const item = makeCustomItem({ ...form, sizes, price: form.category === "pizza" ? "" : form.price }, `custom-${Date.now().toString(36)}`);
    if (!item) { setErr("Naam aur price zaroori hain."); return; }
    setMenuOverrides((m) => ({ ...m, custom: [...(m.custom ?? []), item], images: photo ? { ...(m.images ?? {}), [item.id]: photo } : (m.images ?? {}) }));
    setForm(blank); setSizeRows(blankSizes()); setPhoto(""); setErr(""); setAdding(false);
  };
  const remove = (id: string) => {
    setMenuOverrides((m) => {
      const images = { ...(m.images ?? {}) }; delete images[id];
      const prices = Object.fromEntries(Object.entries(m.prices).filter(([k]) => k !== id && !k.startsWith(`${id}|`)));
      const isCustom = (m.custom ?? []).some((p) => p.id === id);
      return { ...m, prices, images, custom: (m.custom ?? []).filter((p) => p.id !== id), hidden: m.hidden.filter((h) => h !== id), deleted: isCustom ? (m.deleted ?? []) : [...(m.deleted ?? []), id] };
    });
    setDel(null);
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
        <div><h2 className="font-display text-xl font-semibold">Menu Management</h2><p className="text-xs text-muted-foreground">Add new items, edit prices or mark items unavailable. Changes show on the POS screen right away. {changed > 0 && <b className="text-primary">{changed} changes</b>}</p></div>
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
            <label className="grid gap-1 text-xs font-medium text-muted-foreground sm:col-span-2">Short description / included items<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder={form.category === "deals" ? "Add items above or type them here" : "e.g. Chicken, cheese, special sauce"} className="rounded-md border bg-background px-3 py-2 text-sm text-foreground" /></label>
            {form.category === "pizza" ? (
              <div className="space-y-2 sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">Sizes aur prices — jo size nahi banta usay Off kar dein</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SIZE_NAMES.map((n) => (
                    <div key={n} className={`flex items-center gap-2 rounded-md border p-2 ${sizeRows[n]!.on ? "" : "opacity-50"}`}>
                      <Switch checked={sizeRows[n]!.on} onCheckedChange={(v) => setSizeRows((r) => ({ ...r, [n]: { ...r[n]!, on: v } }))} aria-label={`${n} available`} />
                      <span className="w-16 text-sm font-medium">{n}</span>
                      <span className="text-xs text-muted-foreground">Rs.</span>
                      <Input type="number" min={1} disabled={!sizeRows[n]!.on} value={sizeRows[n]!.price} onChange={(e) => setSizeRows((r) => ({ ...r, [n]: { ...r[n]!, price: e.target.value } }))} placeholder={sizeRows[n]!.on ? "Price" : "Not available"} className="h-8 text-sm" aria-label={`${n} price`} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">{form.category === "deals" ? "Deal price (Rs.)" : "Price (Rs.)"}<Input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 850" className="text-sm" /></label>
            )}
            {form.category === "deals" && (
              <div className="space-y-2 rounded-lg border bg-muted/40 p-3 sm:col-span-2">
                <p className="text-xs font-semibold">What is included in this deal? Select an item and press "Add to deal". The description fills in by itself.</p>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="grid gap-1 text-[11px] text-muted-foreground">Item
                    <select value={part.cat} onChange={(e) => setPart({ ...part, cat: e.target.value as CategoryId, pick: "", q: "", mode: "any" })} className="h-9 rounded-md border bg-background px-2 text-sm text-foreground">{DEAL_PARTS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</select>
                  </label>
                  <label className="grid gap-1 text-[11px] text-muted-foreground">Qty<Input type="number" min={1} value={part.qty} onChange={(e) => setPart({ ...part, qty: e.target.value })} className="h-9 w-16 text-sm" /></label>
                  {part.cat === "pizza" && (
                    <label className="grid gap-1 text-[11px] text-muted-foreground">Size
                      <select value={part.size} onChange={(e) => setPart({ ...part, size: e.target.value })} className="h-9 rounded-md border bg-background px-2 text-sm text-foreground">{SIZE_NAMES.map((n) => <option key={n}>{n}</option>)}</select>
                    </label>
                  )}
                  <label className="grid gap-1 text-[11px] text-muted-foreground">Kaun sa?
                    <select value={part.mode} onChange={(e) => setPart({ ...part, mode: e.target.value as "any" | "specific" })} className="h-9 rounded-md border bg-background px-2 text-sm text-foreground">
                      <option value="any">{part.cat === "pizza" ? "All regular flavours (customer choice)" : "Any / customer choice"}</option>
                      <option value="specific">{part.cat === "pizza" ? "Specific pizza" : "Specific item"}</option>
                    </select>
                  </label>
                  <Button type="button" variant="outline" className="h-9" onClick={addPart} disabled={part.mode === "specific" && !part.pick}><Plus /> Add to deal</Button>
                </div>
                {part.mode === "specific" && (
                  <div className="space-y-1.5">
                    <Input value={part.q} onChange={(e) => setPart({ ...part, q: e.target.value })} placeholder="Type a name to search..." className="h-8 text-sm" />
                    <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                      {partOptions.map((p) => <button type="button" key={p.id} onClick={() => setPart({ ...part, pick: p.id })} className={`rounded-full border px-2.5 py-1 text-xs ${part.pick === p.id ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}>{p.name}</button>)}
                      {!partOptions.length && <span className="text-xs text-muted-foreground">Koi item nahi mila.</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
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
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setAdding(false); setErr(""); setSizeRows(blankSizes()); }}>Cancel</Button><Button onClick={save}><Plus /> Save item</Button></div>
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
              <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border bg-background">{(productImages[p.id] ?? o.images?.[p.id]) ? <img src={productImages[p.id] ?? o.images?.[p.id]} alt={p.name} loading="lazy" className="h-full w-full object-cover" /> : <ImagePlus className="size-5 text-muted-foreground" />}</div>
              <div className="min-w-[160px] flex-1"><p className="text-sm font-semibold">{p.name}{mine && <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">NEW</span>}</p><p className="text-[11px] capitalize text-muted-foreground">{p.category}{p.tag ? ` · ${p.tag}` : ""}{on ? "" : " · Unavailable"}</p></div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {p.price !== undefined && <PriceBox k={priceKey(p.id)} base={p.price} />}
                {p.sizes?.map((s) => <PriceBox key={s.size} k={priceKey(p.id, s.size)} base={s.price} label={s.size} />)}
              </div>
              <label className="flex items-center gap-2 text-xs"><Switch checked={on} onCheckedChange={(v) => toggle(p.id, v)} aria-label={`${p.name} available`} />{on ? "Available" : "Off"}</label>
              {<Button variant="ghost" size="icon" onClick={() => setDel({ id: p.id, name: p.name, regular: !mine, step: 1 })} aria-label={`Delete ${p.name}`}><Trash2 className="text-destructive" /></Button>}
            </div>
          );
        })}
        {!list.length && <p className="p-6 text-center text-sm text-muted-foreground">No items found.</p>}
      </div>
    </div>
      <AlertDialog open={!!del} onOpenChange={(v) => !v && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{del?.step === 2 ? "Are you sure you want to delete this regular item?" : `Delete "${del?.name}"?`}</AlertDialogTitle>
            <AlertDialogDescription>{del?.step === 2 ? "Yeh item restaurant ke printed menu mein hai. Delete ke baad POS screen se hamesha ke liye hat jayega." : "Yeh item menu se hat jayega. Sirf chhupana ho to Available switch Off kar dein."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={(e) => { if (!del) return; if (del.regular && del.step === 1) { e.preventDefault(); setDel({ ...del, step: 2 }); } else remove(del.id); }}>{del?.regular && del.step === 1 ? "Yes, continue" : "Delete permanently"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
