import { Minus, Plus, Trash2, ShoppingBag, Printer, RotateCcw, X } from "lucide-react";
import { type CartLine, cartTotals, formatRs, lineTotal } from "@/lib/cart";

export type OrderType = "Dine-in" | "Takeaway";

interface Props {
  lines: CartLine[];
  orderNo: number;
  orderType: OrderType;
  table: string;
  setOrderType: (t: OrderType) => void;
  setTable: (t: string) => void;
  onQty: (key: string, d: number) => void;
  onClear: () => void;
  onNewOrder: () => void;
  onPrint: () => void;
  onCloseMobile?: () => void;
}

export function CartPanel(p: Props) {
  const { subtotal, total, items } = cartTotals(p.lines);
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Order</p>
            <h2 className="text-lg font-bold">#{p.orderNo}</h2>
          </div>
          {p.onCloseMobile && (
            <button onClick={p.onCloseMobile} aria-label="Close order" className="grid h-10 w-10 place-items-center rounded-full bg-muted">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(["Dine-in", "Takeaway"] as OrderType[]).map((t) => (
            <button
              key={t}
              onClick={() => p.setOrderType(t)}
              className={`rounded-md py-2 text-sm font-semibold transition ${p.orderType === t ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {p.orderType === "Dine-in" && (
          <input
            value={p.table}
            onChange={(e) => p.setTable(e.target.value)}
            placeholder="Table number (optional)"
            inputMode="numeric"
            className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
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
              <li key={l.key} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{l.name}</p>
                    {l.variant && <p className="text-xs font-medium text-primary">{l.variant}</p>}
                    {l.description && <p className="line-clamp-2 text-[11px] text-muted-foreground">{l.description}</p>}
                    <p className="text-xs text-muted-foreground">{formatRs(l.unitPrice)} each</p>
                  </div>
                  <button onClick={() => p.onQty(l.key, -l.qty)} aria-label={`Remove ${l.name}`} className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button onClick={() => p.onQty(l.key, -1)} aria-label="Decrease" className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-muted"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center text-sm font-bold">{l.qty}</span>
                    <button onClick={() => p.onQty(l.key, 1)} aria-label="Increase" className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
                  </div>
                  <span className="text-sm font-bold">{formatRs(lineTotal(l))}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal ({items} items)</span><span>{formatRs(subtotal)}</span></div>
        <div className="mt-1 flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{formatRs(total)}</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={p.onClear} disabled={!p.lines.length} className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-40">
            <Trash2 className="h-4 w-4" /> Clear Cart
          </button>
          <button onClick={p.onNewOrder} className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-semibold hover:bg-muted">
            <RotateCcw className="h-4 w-4" /> New Order
          </button>
        </div>
        <button onClick={p.onPrint} disabled={!p.lines.length} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-40">
          <Printer className="h-5 w-5" /> Print Bill
        </button>
      </div>
    </div>
  );
}
