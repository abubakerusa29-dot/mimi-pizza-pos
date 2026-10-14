import { Plus, ImageOff } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/menuData";
import { productImages } from "@/data/productImages";
import { Button } from "@/components/ui/button";
import { formatRs, startingPrice } from "@/lib/cart";

export function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <Button variant="ghost"
      onClick={() => onSelect(product)}
      className="product-card group flex h-auto flex-col items-stretch justify-start gap-0 overflow-hidden whitespace-normal rounded-lg border border-border bg-card p-0 text-left transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-card active:scale-[0.98]"
    >
      <div className="menu-photo relative aspect-square w-full overflow-hidden">
        {failed || !productImages[product.id] ? <div className="grid h-full place-items-center text-muted-foreground"><ImageOff /></div> : <img src={productImages[product.id]} onError={() => setFailed(true)} alt={product.name} width={480} height={480} loading="lazy" className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-border/50 p-3">
        <div className={`flex flex-col items-start gap-1 ${product.category === "deals" ? "min-h-6" : "min-h-11"}`}>
          <h3 className="min-w-0 text-sm font-semibold leading-snug text-foreground">{product.name}</h3>
          {product.tag && (
            <span className="text-[10px] font-medium uppercase text-muted-foreground">{product.tag}</span>
          )}
        </div>
        {product.description && product.category === "deals" && <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>}
        {product.sizes && <p className="line-clamp-1 text-xs text-muted-foreground">{product.sizes.map((s) => s.size).join(" · ")}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-bold text-primary">
            {product.sizes ? `From ${formatRs(startingPrice(product))}` : formatRs(product.price ?? 0)}
          </span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Plus className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Button>
  );
}
