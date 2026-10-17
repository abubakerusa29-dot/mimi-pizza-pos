import { findCustomer, searchCustomers } from "@/lib/backOffice";
import { Minus, Plus, Trash2, ShoppingBag, Printer, Search, RotateCcw, X, UtensilsCrossed, Package, Bike } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { products } from "@/data/menuData";
import { useOrder, type OrderType } from "./OrderContext";
import { type Addon, type CartLine, cartTotals, formatRs, lineTotal } from "@/lib/cart";
import { occupiedTables, tableLabel } from "@/lib/tables";

export type { OrderType } from "./OrderContext";

interface Props {
  lines: CartLine[];
  orderNo: number;
  orderType: OrderType;
  table: string;
  setOrderType: (t: OrderType) => void;
  setTable: (t: string) => void;
  onQty: (key: string, d: number) => void;
  onAddon: (key: string, addon: Addon) => void;
  onClear: () => void;
  onNewOrder: () => void;
  onPrint: () => void;
  onCloseMobile?: () => void;
}

const burgerAddons: Addon[] = ["ex-cheese-slice", "ex-patty"].flatMap((id) => {
  const x = products.find((q) => q.id === id);
  return x ? [{ id, name: x.name, price: x.price ?? 0 }] : [];
});

export function CartPanel(p: Props) {
  const { subtotal, total, items } = cartTotals(p.lines);
  const { backOffice, phone, setPhone, address, setAddress, area, setArea, areaList, tableList, invoices } = useOrder();
  const occupied = occupiedTables(invoices);
  const [openAddon, setOpenAddon] = useState<string | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [findQ, setFindQ] = useState("");
  const found = searchCustomers(backOffice.customers, findQ);
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold"><span className="font-medium text-muted-foreground">Current Order </span>#{p.orderNo}</h2>
          </div>
          {p.onCloseMobile && (
            <Button variant="ghost" size="icon" onClick={p.onCloseMobile} aria-label="Close order" className="h-10 w-10 bg-muted">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
          {(["Dine-in", "Takeaway", "Delivery"] as OrderType[]).map((t) => {
            const Icon = t === "Dine-in" ? UtensilsCrossed : t === "Delivery" ? Bike : Package;
            return <Button
              variant="ghost"
              key={t}
              aria-pressed={p.orderType === t}
              onClick={() => p.setOrderType(t)}
              className={`h-14 flex-col gap-1 rounded-md px-1 text-xs font-semibold transition ${p.orderType === t ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"}`}
            >
              <Icon />{t}
            </Button>;
          })}
        </div>
        {p.orderType === "Dine-in" && (
          <div className="mt-2">
            {tableList.length > 0 && (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose table">
                {tableList.map((t) => {
                  const label = tableLabel(t);
                  const busy = occupied.has(label) && p.table !== label;
                  return (
                    <button key={label} type="button" aria-pressed={p.table === label} onClick={() => p.setTable(p.table === label ? "" : label)} title={busy ? `${label} has an open order` : label}
                      className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${p.table === label ? "border-primary bg-primary text-primary-foreground" : busy ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-input bg-background text-foreground hover:border-primary"}`}>
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
            <input
              value={p.table}
              onChange={(e) => p.setTable(e.target.value)}
              placeholder="Or type a table name (optional)"
              aria-label="Table"
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        )}
        {p.orderType === "Delivery" && (
          <div className="mt-2 grid gap-2">
            <div className="flex gap-2">
              <input value={phone} onChange={(e) => { setPhone(e.target.value); const c = findCustomer(backOffice.customers, e.target.value); if (c) { if (!address.trim()) setAddress(c.address); if (c.area && !area) setArea(c.area); } }} list="saved-customer-phones" placeholder="Customer phone number" type="tel" inputMode="tel" aria-label="Customer phone number" className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <Button type="button" variant={findOpen ? "default" : "outline"} size="icon" onClick={() => setFindOpen(!findOpen)} aria-label="Search saved customer" title="Search customer by name, phone or area" className="h-10 w-10 shrink-0"><Search className="h-4 w-4" /></Button>
            </div>
            {findOpen && (
              <div className="rounded-lg border border-input bg-background p-2">
                <input autoFocus value={findQ} onChange={(e) => setFindQ(e.target.value)} placeholder="Search name, phone or area" aria-label="Search customers" className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary" />
                <div className="mt-1 max-h-40 overflow-y-auto">
                  {findQ.trim() && !found.length && <p className="p-2 text-xs text-muted-foreground">No saved customer found.</p>}
                  {found.map((c) => (
                    <button key={c.phone} type="button" onClick={() => { setPhone(c.phone); setAddress(c.address); if (c.area) setArea(c.area); setFindOpen(false); setFindQ(""); }} className="block w-full rounded-md px-2 py-1.5 text-left hover:bg-muted">
                      <p className="text-sm font-semibold">{c.name || "Customer"} <span className="font-normal text-muted-foreground">{c.phone}</span></p>
                      <p className="truncate text-[11px] text-muted-foreground">{c.address || "No address"}{c.area ? ` · ${c.area}` : ""}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <datalist id="saved-customer-phones">{backOffice.customers.map((c) => <option key={c.phone} value={c.phone}>{c.name}</option>)}</datalist>
            {findCustomer(backOffice.customers, phone) && <p className="-mt-1 text-[11px] font-medium text-primary">Saved customer: {findCustomer(backOffice.customers, phone)!.name || "Regular"}</p>}
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address / location" rows={2} aria-label="Delivery address" className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <select value={area} onChange={(e) => setArea(e.target.value)} aria-label="Delivery area" className="h-9 rounded-lg border border-input bg-background px-2 text-sm"><option value="">Area</option>{areaList.map((a) => <option key={a}>{a}</option>)}</select>
            <p className="text-[11px] text-muted-foreground">Rider is assigned later from Riders & Cash when the parcel is ready.</p>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {p.lines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-7 w-7 text-primary" />
            </div>
            <p className="max-w-[200px] text-sm">Your order is empty. Add products from the menu.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {p.lines.map((l) => (
              <li key={l.key} className="border-b border-border px-1 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{l.name}</p>
                    {l.variant && <p className="text-xs font-medium text-primary">{l.variant}</p>}
                    {l.addons?.length ? <p className="text-xs font-medium text-primary">+ {l.addons.join(", ")}</p> : null}
                    {l.description && <p className="line-clamp-2 text-[11px] text-muted-foreground">{l.description}</p>}
                    <p className="text-xs text-muted-foreground">{formatRs(l.unitPrice)} each</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => p.onQty(l.key, -l.qty)} aria-label={`Remove ${l.name}`} className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={() => p.onQty(l.key, -1)} aria-label="Decrease" className="h-8 w-8"><Minus /></Button>
                    <span className="w-8 text-center text-sm font-bold">{l.qty}</span>
                    <Button size="icon" onClick={() => p.onQty(l.key, 1)} aria-label="Increase" className="h-8 w-8"><Plus /></Button>
                  </div>
                  <span className="text-sm font-bold">{formatRs(lineTotal(l))}</span>
                </div>
                {l.addonGroup === "burger" && (
                  <div className="mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setOpenAddon(openAddon === l.key ? null : l.key)} className="h-7 px-2 text-xs font-semibold text-primary hover:bg-secondary">
                      <Plus className="h-3.5 w-3.5" /> Add add-on
                    </Button>
                    {openAddon === l.key && (
                      <div className="mt-1 grid grid-cols-2 gap-1.5">
                        {burgerAddons.map((a) => (
                          <Button key={a.id} variant="outline" size="sm" onClick={() => { p.onAddon(l.key, a); setOpenAddon(null); }} className="h-auto flex-col gap-0 py-1.5 text-xs">
                            <span className="font-semibold">{a.name}</span>
                            <span className="text-primary">+{formatRs(a.price)}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                    {l.qty > 1 && openAddon === l.key && <p className="mt-1 text-[10px] text-muted-foreground">Applies to 1 of {l.qty}. Tap again for more.</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal ({items} items)</span><span>{formatRs(subtotal)}</span></div>
        <div className="mt-1 flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{formatRs(total)}</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={p.onClear} disabled={!p.lines.length} className="h-10 gap-1.5 text-xs font-semibold">
            <Trash2 className="h-4 w-4" /> Clear Cart
          </Button>
          <Button variant="outline" onClick={p.onNewOrder} className="h-10 gap-1.5 text-xs font-semibold">
            <RotateCcw className="h-4 w-4" /> New Order
          </Button>
        </div>
        <Button onClick={p.onPrint} disabled={!p.lines.length} className="mt-2 h-12 w-full gap-2 text-base font-bold">
          <Printer className="h-5 w-5" /> Print Bill
        </Button>
      </div>
    </div>
  );
}
