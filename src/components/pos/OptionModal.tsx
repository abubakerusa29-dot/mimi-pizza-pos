import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { regularFlavours, type Product } from "@/data/menuData";
import { formatRs } from "@/lib/cart";

/** Size picker for pizzas, flavour picker for "any regular flavour" deals. */
export function OptionModal({
  product, onClose, onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (p: Product, option: string, price: number) => void;
}) {
  const options = product?.sizes
    ? product.sizes.map((s) => ({ label: s.size, price: s.price }))
    : regularFlavours.map((f) => ({ label: f, price: product?.price ?? 0 }));
  const [sel, setSel] = useState(0);
  useEffect(() => setSel(0), [product]);
  const isPizza = !!product?.sizes;

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product?.name}</DialogTitle>
          <DialogDescription>{isPizza ? "Select a size" : `Choose pizza flavour · ${product?.description ?? ""}`}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {options.map((o, i) => (
            <button
              key={o.label}
              onClick={() => setSel(i)}
              className={`rounded-xl border-2 p-3 text-left transition ${i === sel ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
            >
              <div className="text-sm font-semibold">{o.label}</div>
              {isPizza && <div className="text-sm font-bold text-primary">{formatRs(o.price)}</div>}
            </button>
          ))}
        </div>
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
