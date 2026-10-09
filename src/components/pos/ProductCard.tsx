import { Plus } from "lucide-react";
import type { Product } from "@/data/menuData";
import { productImages } from "@/data/productImages";
import { Button } from "@/components/ui/button";
import { formatRs, startingPrice } from "@/lib/cart";

export function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  return (
    <Button variant="ghost"
      onClick={() => onSelect(product)}
      className="group h-auto items-stretch justify-start gap-0 whitespace-normal p-0 flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-card hover:border-primary/60 hover:shadow-md active:scale-[0.97]"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-card">
        <img src={productImages[product.id]} alt={product.description ?? `${product.name} ${product.tag ?? ""}`} width={480} height={480} loading="lazy" className="h-full w-full object-contain transition-transform group-hover:scale-105" />
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
    </Button>
  );
}
