import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pizza, Search, RotateCcw, ShoppingBag, SearchX } from "lucide-react";
import { toast } from "sonner";
import { categories, products, type CategoryId, type Product } from "@/data/menuData";
import { addLine, cartTotals, changeQty, formatRs, type CartLine } from "@/lib/cart";
import { ProductCard } from "@/components/pos/ProductCard";
import { OptionModal } from "@/components/pos/OptionModal";
import { CartPanel, type OrderType } from "@/components/pos/CartPanel";
import { ReceiptPreview } from "@/components/pos/ReceiptPreview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mimi’s Pizza POS — Counter Billing" },
      { name: "description", content: "Point of sale demo for Mimi’s Pizza: take orders, calculate bills and print receipts." },
      { property: "og:title", content: "Mimi’s Pizza POS — Counter Billing" },
      { property: "og:description", content: "Take orders, calculate bills and print receipts at Mimi’s Pizza." },
    ],
  }),
  component: POS,
});

function POS() {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderNo, setOrderNo] = useState(1001);
  const [orderType, setOrderType] = useState<OrderType>("Dine-in");
  const [table, setTable] = useState("");
  const [modal, setModal] = useState<Product | null>(null);
  const [receiptAt, setReceiptAt] = useState<Date | null>(null);
  const [mobileCart, setMobileCart] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (category === "all" || p.category === category) && (!q || `${p.name} ${p.tag ?? ""}`.toLowerCase().includes(q)),
    );
  }, [category, query]);

  const add = (item: Omit<CartLine, "qty">) => {
    setLines((l) => addLine(l, item));
    toast.success(`${item.name}${item.variant ? ` (${item.variant})` : ""} added`, { duration: 1200 });
  };

  const select = (p: Product) => {
    if (p.sizes || p.flavourChoice) return setModal(p);
    add({ key: p.id, name: p.tag ? `${p.name} ${p.tag}` : p.name, description: p.description, unitPrice: p.price ?? 0 });
  };

  const clear = () => {
    if (lines.length && !window.confirm("Clear all items from this order?")) return;
    setLines([]);
  };
  const newOrder = () => {
    if (lines.length && !window.confirm("Start a new order? The current order will be discarded.")) return;
    setLines([]);
    setTable("");
    setOrderType("Dine-in");
    setOrderNo((n) => n + 1);
    setMobileCart(false);
  };

  const { total, items } = cartTotals(lines);
  const cartProps = {
    lines, orderNo, orderType, table, setOrderType, setTable,
    onQty: (k: string, d: number) => setLines((l) => changeQty(l, k, d)),
    onClear: clear, onNewOrder: newOrder, onPrint: () => setReceiptAt(new Date()),
  };

  return (
    <div className="pos-app flex h-dvh flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Pizza className="h-5 w-5" /></span>
          <h1 className="truncate font-display text-lg font-bold">Mimi’s Pizza</h1>
          <span className="shrink-0 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-accent-foreground">POS DEMO</span>
        </div>
        <button onClick={newOrder} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90">
          <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">New Order</span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="space-y-3 px-4 pt-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${category === c.id ? "bg-primary text-primary-foreground shadow" : "border border-border bg-card text-foreground hover:border-primary/50"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-28 md:pb-4">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                <SearchX className="h-10 w-10" />
                <p className="text-sm">No products match “{query}”.</p>
                <button onClick={() => { setQuery(""); setCategory("all"); }} className="text-sm font-semibold text-primary">Clear search</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {visible.map((p) => <ProductCard key={p.id} product={p} onSelect={select} />)}
              </div>
            )}
          </div>
        </main>

        <aside className="hidden w-[34%] min-w-[300px] max-w-[420px] border-l border-border md:block">
          <CartPanel {...cartProps} />
        </aside>
      </div>

      {/* Mobile order bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <button onClick={() => setMobileCart(true)} className="flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground">
          <span className="flex items-center gap-2 text-sm font-semibold"><ShoppingBag className="h-5 w-5" /> {items} items · {formatRs(total)}</span>
          <span className="text-sm font-bold">View Order</span>
        </button>
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
          add({ key: `${p.id}|${option}`, name: p.name, variant: p.sizes ? option : `${option} Pizza`, description: p.description, unitPrice: price });
          setModal(null);
        }}
      />
      <ReceiptPreview open={!!receiptAt} date={receiptAt ?? new Date()} lines={lines} orderNo={orderNo} orderType={orderType} table={table} onBack={() => setReceiptAt(null)} />
    </div>
  );
}
