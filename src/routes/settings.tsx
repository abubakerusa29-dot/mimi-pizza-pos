import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, RotateCcw, Store, Bike, MapPin, Trash2 } from "lucide-react";
import { restaurantInfo } from "@/data/menuData";
import { riders as defaultRiders, deliveryAreas as defaultAreas } from "@/data/riders";
import { useOrder } from "@/components/pos/OrderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Mimi’s Pizza" }, { name: "description", content: "Restaurant profile, riders and delivery areas for Mimi’s Pizza POS." }, { property: "og:title", content: "Settings — Mimi’s Pizza" }, { property: "og:description", content: "Edit restaurant details printed on receipts and manage riders and areas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Settings,
});

function Settings() {
  const { restaurant, setRestaurant, riderList, setRiderList, areaList, setAreaList } = useOrder();
  const [newRider, setNewRider] = useState("");
  const [newArea, setNewArea] = useState("");

  const field = (key: keyof typeof restaurantInfo, label: string) => (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <Input value={restaurant[key]} onChange={(e) => setRestaurant({ ...restaurant, [key]: e.target.value })} className="text-sm text-foreground" aria-label={label} />
    </label>
  );

  const addTo = (list: string[], set: (v: string[]) => void, value: string, clear: () => void) => {
    const v = value.trim();
    if (!v || list.includes(v)) return;
    set([...list, v]);
    clear();
  };

  const nameList = (title: string, icon: typeof Bike, list: string[], set: (v: string[]) => void, value: string, setValue: (v: string) => void, placeholder: string) => (
    <section className="rounded-xl border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">{(() => { const I = icon; return <I className="size-4 text-primary" />; })()}{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {list.map((r) => (
          <span key={r} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
            {r}
            <button onClick={() => set(list.filter((x) => x !== r))} aria-label={`Remove ${r}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></button>
          </span>
        ))}
        {!list.length && <p className="text-xs text-muted-foreground">List empty — add at least one.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTo(list, set, value, () => setValue(""))} placeholder={placeholder} className="h-9 text-sm" aria-label={placeholder} />
        <Button size="sm" className="h-9" onClick={() => addTo(list, set, value, () => setValue(""))}><Plus className="size-4" /> Add</Button>
      </div>
    </section>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-display text-xl font-semibold">Settings</h2><p className="text-xs text-muted-foreground">Restaurant ki details receipts par print hoti hain. Riders aur areas yahan se manage karein.</p></div>
        <Button variant="outline" className="h-9 text-xs" onClick={() => { setRestaurant(restaurantInfo); setRiderList(defaultRiders); setAreaList(defaultAreas); }}><RotateCcw /> Reset all</Button>
      </div>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Store className="size-4 text-primary" /> Restaurant profile</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">Yeh details customer receipt ke top par aati hain.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {field("address", "Address")}
          {field("phone", "Phone")}
          {field("hours", "Opening hours")}
          {field("delivery", "Delivery note")}
        </div>
      </section>

      {nameList("Riders", Bike, riderList, setRiderList, newRider, setNewRider, "New rider name")}
      {nameList("Delivery areas", MapPin, areaList, setAreaList, newArea, setNewArea, "New area name")}

      <p className="text-[11px] text-muted-foreground">Note: yeh settings page refresh par reset ho jati hain — permanent save Phase 7 mein aayega.</p>
    </div>
  );
}
