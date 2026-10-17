import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { regularFlavours, type Product } from "@/data/menuData";
import { formatRs } from "@/lib/cart";
import { dealPizza, dealPizzaOptions } from "@/lib/dealPizza";

/** Size picker for pizzas; pizza flavour picker (regular or special, price adjusted) for deals. */
export function OptionModal({
  product, onClose, onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (p: Product, option: string, price: number) => void;
}) {
  const isPizza = !!product?.sizes;
  const inc = product && !isPizza ? dealPizza(product) : null;
  const base = product?.price ?? 0;
  const options: { label: string; price: number; note?: string; group?: string }[] = product?.sizes
    ? product.sizes.map((s) => ({ label: s.size, price: s.price }))
    : inc
      ? dealPizzaOptions(product!).map((o) => ({
          label: o.label, price: base + o.diff, group: o.kind,
          note: o.diff === 0 ? "No change" : o.diff > 0 ? `+${formatRs(o.diff)}` : `−${formatRs(-o.diff)}`,
        }))
      : regularFlavours.map((f) => ({ label: f, price: base }));
  const defaultIdx = Math.max(0, options.findIndex((o) => o.note === "No change"));
  const [sel, setSel] = useState(0);
  useEffect(() => setSel(defaultIdx), [product]); // eslint-disable-line react-hooks/exhaustive-deps
  const groups = [...new Set(options.map((o) => o.group ?? ""))];

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product?.name}</DialogTitle>
          <p className="rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold text-primary">Double-tap an option to quickly add, or press Add to Order.</p>
          <DialogDescription>{isPizza ? (product?.description ?? "Select an option") : `${inc ? `Choose ${inc.size} pizza flavour. Price adjusts for Regular or Special.` : "Choose pizza flavour"} · ${product?.description ?? ""}`}</DialogDescription>
        </DialogHeader>
        {groups.map((g) => (
          <div key={g}>
            {g && <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{g} pizzas</p>}
            <div className="grid grid-cols-2 gap-2">
              {options.map((o, i) => (o.group ?? "") === g && (
                <button
                  key={o.label}
                  onClick={() => setSel(i)}
                  onDoubleClick={() => product && onAdd(product, o.label, o.price)}
                  className={`rounded-xl border-2 p-3 text-left transition ${i === sel ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                >
                  <div className="text-sm font-semibold">{o.label}</div>
                  {isPizza && <div className="text-sm font-bold text-primary">{formatRs(o.price)}</div>}
                  {o.note && <div className={`text-xs font-bold ${o.note === "No change" ? "text-muted-foreground" : "text-primary"}`}>{o.note}</div>}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-2 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-3 text-sm font-semibold hover:bg-muted">Cancel</button>
          <button
            onClick={() => { const o = options[sel]; if (product && o) onAdd(product, o.label, o.price); }}
            className="flex-[2] rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            Add to Order · {formatRs(options[sel]?.price ?? 0)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
