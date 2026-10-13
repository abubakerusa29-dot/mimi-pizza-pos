import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  extraPatty, extraToppingBySize, regularFlavours, sauceExtras, specialFlavours, type Extra, type Product,
} from "@/data/menuData";
import { formatRs } from "@/lib/cart";

export interface OptionResult { variant?: string | undefined; extras: Extra[]; unitPrice: number }

const needsDialog = (p: Product) => !!(p.sizes || p.flavourChoice || p.extras);
export { needsDialog };

/** Size / flavour / add-on picker. Price = base option + selected extras. */
export function OptionModal({
  product, onClose, onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (p: Product, r: OptionResult) => void;
}) {
  const [size, setSize] = useState(0);
  const [flavour, setFlavour] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  useEffect(() => { setSize(0); setFlavour(0); setPicked([]); }, [product]);

  const sizeOpt = product?.sizes?.[size];
  const flavours = product?.flavourChoice === "special" ? specialFlavours : product?.flavourChoice ? regularFlavours : [];
  const extras: Extra[] = !product?.extras ? [] : product.extras === "pizza"
    ? [{ id: "topping", label: "Extra Topping", price: extraToppingBySize[sizeOpt?.size ?? ""] ?? 100 }, ...sauceExtras]
    : product.extras === "smash" ? [extraPatty, ...sauceExtras] : sauceExtras;
  const chosen = extras.filter((e) => picked.includes(e.id));
  const base = sizeOpt?.price ?? product?.price ?? 0;
  const unitPrice = base + chosen.reduce((s, e) => s + e.price, 0);

  const variant = [sizeOpt?.size, flavours[flavour] && `${flavours[flavour]} Pizza`].filter(Boolean).join(" · ") || undefined;
  const chip = (active: boolean) =>
    `rounded-xl border-2 p-3 text-left transition ${active ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`;

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product?.name}</DialogTitle>
          {product?.description && <DialogDescription>{product.description}</DialogDescription>}
        </DialogHeader>

        {product?.sizes && (
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Size</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {product.sizes.map((s, i) => (
                <button key={s.size} onClick={() => setSize(i)} className={chip(i === size)}>
                  <div className="text-sm font-semibold">{s.size}</div>
                  <div className="text-sm font-bold text-primary">{formatRs(s.price)}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {flavours.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">
              {product?.flavourChoice === "special" ? "Special" : "Regular"} pizza flavour
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {flavours.map((f, i) => (
                <button key={f} onClick={() => setFlavour(i)} className={chip(i === flavour)}>
                  <div className="text-sm font-semibold">{f}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {extras.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Extra sauce & add-ons (optional)</h4>
            <div className="grid grid-cols-2 gap-2">
              {extras.map((e) => {
                const on = picked.includes(e.id);
                return (
                  <button key={e.id} aria-pressed={on}
                    onClick={() => setPicked((p) => (on ? p.filter((x) => x !== e.id) : [...p, e.id]))}
                    className={`${chip(on)} flex items-center justify-between py-2`}>
                    <span className="text-sm font-medium">{e.label}</span>
                    <span className="text-xs font-bold text-primary">+{formatRs(e.price)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-2 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-3 text-sm font-semibold hover:bg-muted">Cancel</button>
          <button
            onClick={() => product && onAdd(product, { variant, extras: chosen, unitPrice })}
            className="flex-[2] rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
          >
            Add to Order · {formatRs(unitPrice)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
