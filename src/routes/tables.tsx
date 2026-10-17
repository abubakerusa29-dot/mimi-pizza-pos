import { confirmDialog } from "@/components/ConfirmDialog";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Armchair, Plus, Trash2, Users } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { occupiedTables, tableLabel } from "@/lib/tables";

export const Route = createFileRoute("/tables")({
  head: () => ({ meta: [{ title: "Table Management | Mimi’s Pizza POS" }, { name: "description", content: "Add dine-in tables and see which tables are free or busy." }, { property: "og:title", content: "Table Management | Mimi’s Pizza POS" }, { property: "og:description", content: "Set up dine-in tables for Mimi’s Pizza and track open orders." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: TablesPage,
});

function TablesPage() {
  const { tableList, setTableList, invoices, setInvoiceStatus } = useOrder();
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [seats, setSeats] = useState("4");
  const occupied = occupiedTables(invoices);
  const today = new Date().toDateString();

  const add = () => {
    const n = name.trim();
    if (!n) return;
    const t = { name: n, section: section.trim(), seats: Math.max(1, Number(seats) || 1) };
    if (tableList.some((x) => tableLabel(x) === tableLabel(t))) return;
    setTableList([...tableList, t]);
    setName("");
  };
  const freeTable = (label: string) => {
    invoices.filter((i) => i.orderType === "Dine-in" && i.table === label && !i.status && new Date(i.date).toDateString() === today).forEach((i) => setInvoiceStatus(i.orderNo, "Delivered"));
  };

  return (
    <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Table Management</h2>
        <p className="text-xs text-muted-foreground">Add your dine-in tables. The cashier picks one on the POS screen and it prints on the kitchen slip.</p>
      </div>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Add a table</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_90px_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Table name, e.g. Table 5" aria-label="Table name" />
          <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="Section, e.g. Outdoor (optional)" aria-label="Section" />
          <Input value={seats} onChange={(e) => setSeats(e.target.value)} type="number" min={1} aria-label="Seats" />
          <Button onClick={add}><Plus /> Add</Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tableList.map((t) => {
          const label = tableLabel(t);
          const busy = occupied.has(label);
          return (
            <div key={label} className={`rounded-xl border p-4 ${busy ? "border-destructive/40 bg-destructive/5" : "bg-card"}`}>
              <div className="flex items-start justify-between gap-2">
                <Armchair className={`size-6 ${busy ? "text-destructive" : "text-primary"}`} />
                <button onClick={async () => { if (await confirmDialog(`Delete ${label}?`, { title: "Delete table", confirmLabel: "Delete" })) setTableList(tableList.filter((x) => tableLabel(x) !== label)); }} aria-label={`Delete ${label}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
              <p className="mt-2 font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.section || "No section"}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3" /> {t.seats} seats</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${busy ? "bg-destructive text-destructive-foreground" : "bg-muted text-foreground"}`}>{busy ? "Busy" : "Free"}</span>
                {busy && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => freeTable(label)}>Mark free</Button>}
              </div>
            </div>
          );
        })}
        {!tableList.length && <p className="col-span-full text-sm text-muted-foreground">No tables yet. Add your first table above.</p>}
      </div>
    </div>
  );
}
