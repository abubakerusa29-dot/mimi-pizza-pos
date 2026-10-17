import { confirmDialog } from "@/components/ConfirmDialog";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRs } from "@/lib/cart";
import { toast } from "sonner";
import { cleanPhone, customerHistory, upsertCustomer } from "@/lib/backOffice";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers | Mimi’s Pizza POS" }, { name: "description", content: "Save regular customers and their addresses for fast delivery orders." }, { property: "og:title", content: "Customers | Mimi’s Pizza POS" }, { property: "og:description", content: "Regular customer list with order history." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { backOffice, updateBackOffice, invoices, areaList } = useOrder();
  const [f, setF] = useState<{ phone: string; name: string; address: string; notes: string; area?: string }>({ phone: "", name: "", address: "", notes: "", area: "" });
  const [q, setQ] = useState("");
  const save = () => {
    if (cleanPhone(f.phone).length < 3) { toast.error("Please enter a phone number."); return; }
    updateBackOffice({ customers: upsertCustomer(backOffice.customers, f) });
    toast.success(`Customer ${f.name || f.phone} saved`);
    setF({ phone: "", name: "", address: "", notes: "", area: "" });
  };
  const list = backOffice.customers.filter((c) => `${c.name} ${c.phone} ${c.address} ${c.area ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      <div><h2 className="font-display text-xl font-semibold">Customers</h2><p className="text-xs text-muted-foreground">Save regular customers once. On the POS, type their phone number and the address fills in by itself. Customers are also saved automatically after a delivery order.</p></div>
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Add or update a customer</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Phone number" type="tel" aria-label="Phone" />
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Name" aria-label="Name" />
          <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Address" aria-label="Address" />
          <select value={f.area ?? ""} onChange={(e) => setF({ ...f, area: e.target.value })} aria-label="Area" className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="">Area (optional)</option>{areaList.map((a) => <option key={a}>{a}</option>)}</select>
          <Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Notes, e.g. extra spicy (optional)" aria-label="Notes" />
          <Button onClick={save}><Plus /> Save customer</Button>
        </div>
      </section>
      <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, phone or address" className="pl-9" aria-label="Search customers" /></div>
      {list.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No customers yet.</p>}
      <div className="grid gap-2">
        {list.map((c) => {
          const h = customerHistory(invoices, c.phone);
          return (
            <div key={c.phone} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3">
              <button className="min-w-0 text-left" onClick={() => setF(c)} title="Edit">
                <p className="text-sm font-semibold">{c.name || "Customer"} <span className="font-normal text-muted-foreground">{c.phone}</span></p>
                <p className="text-xs text-muted-foreground">{c.address || "No address"}{c.area && ` · ${c.area}`}{c.notes && ` · ${c.notes}`}</p>
                <p className="mt-1 text-xs font-medium text-primary">{h.orders} orders · {formatRs(h.spent)}</p>
              </button>
              <button onClick={async () => { if (await confirmDialog(`Delete ${c.name || c.phone}?`, { title: "Delete customer", confirmLabel: "Delete" })) updateBackOffice({ customers: backOffice.customers.filter((x) => x.phone !== c.phone) }); }} aria-label="Delete customer" className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
