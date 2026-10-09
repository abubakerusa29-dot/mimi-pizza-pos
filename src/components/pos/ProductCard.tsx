import { Pizza, Sandwich, CupSoda, Tag, Plus } from "lucide-react";
import type { Product } from "@/data/menuData";
import { formatRs, startingPrice } from "@/lib/cart";

const icons = { deals: Tag, pizza: Pizza, burgers: Sandwich, drinks: CupSoda };

export function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const Icon = icons[product.category];
  const isDeal = product.category === "deals";
  return (
    <button
      onClick={() => onSelect(product)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md active:scale-[0.97]"
    >
      <div className={`flex h-20 items-center justify-center sm:h-24 ${isDeal ? "bg-accent" : "bg-secondary"}`}>
        <Icon className={`h-9 w-9 ${isDeal ? "text-accent-foreground" : "text-primary"}`} strokeWidth={1.6} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-semibold leading-tight text-foreground">{product.name}</h3>
          {product.tag && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{product.tag}</span>
          )}
        </div>
        {product.description && <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>}
        {product.sizes && <p className="text-xs text-muted-foreground">{product.sizes.map((s) => s.size).join(" · ")}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-primary">
            {product.sizes ? `From ${formatRs(startingPrice(product))}` : formatRs(product.price ?? 0)}
          </span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
