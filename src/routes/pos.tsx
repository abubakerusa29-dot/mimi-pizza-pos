import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, RotateCcw, ShoppingBag, SearchX, Pizza, Package, Sandwich, CupSoda, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { categories, products, type CategoryId, type Product } from "@/data/menuData";
import { addLine, applyAddon, cartTotals, changeQty, formatRs, type Addon, type CartLine } from "@/lib/cart";
import { ProductCard } from "@/components/pos/ProductCard";
import { OptionModal } from "@/components/pos/OptionModal";
import { CartPanel } from "@/components/pos/CartPanel";
import { useOrder } from "@/components/pos/OrderContext";
import { applyOverrides, availableOnly } from "@/lib/menuOverrides";
import { ReceiptPreview } from "@/components/pos/ReceiptPreview";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "Mimi’s Pizza POS — Counter Billing" },
      { name: "description", content: "Point of sale for Mimi’s Pizza: take orders, calculate bills and print receipts." },
      { property: "og:title", content: "Mimi’s Pizza POS — Counter Billing" },
      { property: "og:description", content: "Take orders, calculate bills and print receipts at Mimi’s Pizza." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: POS,
});

function POS() {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const { lines, setLines, orderNo, setOrderNo, orderType, setOrderType, table, setTable, setPhone, setAddress, setRider, setArea, menuOverrides } = useOrder();
  const [modal, setModal] = useState<Product | null>(null);
  const [receiptAt, setReceiptAt] = useState<Date | null>(null);
  const [mobileCart, setMobileCart] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableOnly(applyOverrides(products, menuOverrides), menuOverrides).filter(
      (p) => (category === "all" || p.category === category) && (!q || `${p.name} ${p.tag ?? ""}`.toLowerCase().includes(q)),
    );
  }, [category, query, menuOverrides]);

  const add = (item: Omit<CartLine, "qty">) => {
    setLines((l) => addLine(l, item));
    toast.success(`${item.name}${item.variant ? ` (${item.variant})` : ""} added`, { duration: 1200 });
  };

  const select = (p: Product) => {
    if (p.sizes || p.flavourChoice) return setModal(p);
    add({ key: p.id, name: p.tag ? `${p.name} ${p.tag}` : p.name, description: p.description, unitPrice: p.price ?? 0, addonGroup: p.category === "burgers" ? "burger" : undefined });
  };

  const clear = () => {
    if (lines.length && !window.confirm("Clear all items from this order?")) return;
    setLines([]);
  };
  const newOrder = (skipConfirm?: unknown) => {
    if (skipConfirm !== true && lines.length && !window.confirm("Start a new order? The current order will be discarded.")) return;
    setLines([]);
    setTable("");
    setPhone("");
    setAddress("");
    setRider("");
    setArea("");
    setOrderType("Dine-in");
    setOrderNo((n) => n + 1);
    setMobileCart(false);
  };

  const { total, items } = cartTotals(lines);
  const cartProps = {
    lines, orderNo, orderType, table, setOrderType, setTable,
    onQty: (k: string, d: number) => setLines((l) => changeQty(l, k, d)),
    onAddon: (k: string, a: Addon) => { setLines((l) => applyAddon(l, k, a)); toast.success(`${a.name} added`, { duration: 1200 }); },
    onClear: clear, onNewOrder: newOrder, onPrint: () => setReceiptAt(new Date()),
  };

  return (
    <div className="pos-app flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="space-y-4 px-4 pt-5 lg:px-6">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-xl font-semibold">Point of Sale</h2><p className="mt-0.5 text-xs text-muted-foreground">Mimi’s menu <span className="mx-1">·</span> {products.length} items</p></div><Button variant="outline" onClick={newOrder} className="h-9 text-xs"><RotateCcw /> New Order</Button></div>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {categories.map((c, index) => {
                const Icon = [LayoutGrid, Package, Pizza, Sandwich, CupSoda][index] ?? LayoutGrid;
                return <Button
                  variant="ghost"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`h-10 shrink-0 rounded-lg px-3 text-sm font-semibold transition ${category === c.id ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:border-primary/50"}`}
                >
                  <Icon /> {c.label}
                </Button>;
              })}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-28 md:pb-4 lg:px-6">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                <SearchX className="h-10 w-10" />
                <p className="text-sm">No products match “{query}”.</p>
                <Button variant="link" onClick={() => { setQuery(""); setCategory("all"); }}>Clear search</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {visible.map((p) => <ProductCard key={p.id} product={p} onSelect={select} />)}
              </div>
            )}
          </div>
        </main>

        <aside className="hidden w-[33%] min-w-[300px] max-w-[390px] border-l border-border md:block">
          <CartPanel {...cartProps} />
        </aside>
      </div>

      {/* Mobile order bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <Button onClick={() => setMobileCart(true)} className="flex h-12 w-full items-center justify-between rounded-lg bg-primary px-4 text-primary-foreground">
          <span className="flex items-center gap-2 text-sm font-semibold"><ShoppingBag className="h-5 w-5" /> {items} items · {formatRs(total)}</span>
          <span className="text-sm font-bold">View Order</span>
        </Button>
      </div>
      {mobileCart && (
        <div className="fixed inset-0 z-40 md:hidden">
          <CartPanel {...cartProps} onCloseMobile={() => setMobileCart(false)} />
        </div>
      )}

      <OptionModal
        product={modal}
        onClose={() => setModal(null)}
        onAdd={(p, option, price) => {
          add({ key: `${p.id}|${option}`, addonGroup: p.category === "burgers" ? "burger" : undefined, name: p.name, variant: p.sizes ? option : `${option} Pizza`, description: p.description, unitPrice: price });
          setModal(null);
        }}
      />
      <ReceiptPreview open={!!receiptAt} date={receiptAt ?? new Date()} lines={lines} orderNo={orderNo} orderType={orderType} table={table} onBack={() => setReceiptAt(null)} onDone={() => { setReceiptAt(null); newOrder(true); }} />
    </div>
  );
}
