import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Clock, Bike, Phone, PackageSearch, Pizza, ChevronDown, Navigation, MessageCircle } from "lucide-react";
import hero from "@/assets/storefront-hero.jpg.asset.json";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrderTracker } from "@/components/public/OrderTracker";
import { categories, products, restaurantInfo, type CategoryId, type Product } from "@/data/menuData";
import { productImages } from "@/data/productImages";
import { CALL_NUMBER, MAPS_URL, whatsappLink } from "@/data/publicSite";
import { formatRs } from "@/lib/cart";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mimi’s Pizza Lalamusa — Digital Menu & Live Order Tracking" },
      { name: "description", content: "Browse Mimi’s Pizza deals, pizzas and burgers, order on WhatsApp and track your delivery live in Lalamusa." },
      { property: "og:title", content: "Mimi’s Pizza Lalamusa — Digital Menu" },
      { property: "og:description", content: "Deals, pizzas and burgers. Order on WhatsApp and track your order live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function priceOf(p: Product) {
  if (p.price) return formatRs(p.price);
  const s = p.sizes?.filter((x) => x.price)?.map((x) => x.price!) ?? [];
  return s.length ? `From ${formatRs(Math.min(...s))}` : "";
}

const sectionTitle: Partial<Record<CategoryId, string>> = { deals: "Our Deals", pizza: "Our Pizzas", burgers: "Our Burgers" };

function WhatsAppIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4.9 2.9.8 3.4.7.6-.1 1.8-.7 2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" /></svg>;
}

function MenuCard({ p }: { p: Product }) {
  const img = productImages[p.id];
  const name = p.tag ? `${p.name} ${p.tag}` : p.name;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="overflow-hidden">
        {img ? <img src={img} alt={name} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex aspect-[4/3] items-center justify-center bg-muted"><Pizza className="size-10 text-muted-foreground" /></div>}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-sm font-bold leading-tight sm:text-base">{name}</h3>
        {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
        <p className="mt-auto pt-2 text-sm font-bold text-primary sm:text-base">{priceOf(p)}</p>
        <a href={whatsappLink(`Assalam-o-alaikum Mimi’s Pizza, I want to order: ${name} (${priceOf(p)})`)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-whatsapp text-xs font-bold text-whatsapp-foreground sm:text-sm"><WhatsAppIcon className="size-4" />WhatsApp Order</a>
      </div>
    </article>
  );
}

function MenuSection({ id, items, isMobile }: { id: CategoryId; items: Product[]; isMobile: boolean }) {
  const step = id === "deals" ? 4 : isMobile ? 6 : 8;
  const [shown, setShown] = useState(step);
  const label = sectionTitle[id] ?? categories.find((c) => c.id === id)?.label ?? id;
  const visible = items.slice(0, Math.max(shown, step));
  return (
    <section id={`menu-${id}`} className="scroll-mt-32">
      <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-primary/20 pb-2">
        <h3 className="font-display text-2xl font-bold sm:text-3xl"><span className="text-primary">·</span> {label}</h3>
        <span className="text-xs text-muted-foreground">{items.length} items</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{visible.map((p) => <MenuCard key={p.id} p={p} />)}</div>
      {items.length > visible.length && (
        <div className="mt-5 text-center">
          <button onClick={() => setShown(visible.length + step)} className="inline-flex h-11 items-center gap-1.5 rounded-full border-2 border-primary px-6 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground">View all <ChevronDown className="size-4" /> <span className="font-normal opacity-75">({items.length - visible.length} more)</span></button>
        </div>
      )}
    </section>
  );
}

function Home() {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [q, setQ] = useState("");
  const [id, setId] = useState("");
  const [trackId, setTrackId] = useState<string>();
  const isMobile = useIsMobile();
  const term = q.trim().toLowerCase();
  const groups = useMemo(() => {
    const ids = categories.filter((c) => c.id !== "all").map((c) => c.id as CategoryId);
    return ids
      .filter((c) => cat === "all" || c === cat)
      .map((c) => ({ id: c, items: products.filter((p) => p.category === c && (!term || `${p.name} ${p.tag ?? ""} ${p.description ?? ""}`.toLowerCase().includes(term))) }))
      .filter((g) => g.items.length);
  }, [cat, term]);

  const pick = (c: CategoryId | "all") => {
    setCat(c);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="h-dvh overflow-y-auto scroll-smooth bg-background">
      <PublicHeader />

      <section className="relative isolate overflow-hidden">
        <img src={hero.url} alt="Mimi’s Pizza shop front in Lalamusa" width={1322} height={682} className="absolute inset-0 -z-10 h-full w-full object-cover object-[35%_center]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/20 max-md:bg-gradient-to-t max-md:from-foreground/95 max-md:via-foreground/60 max-md:to-foreground/10" />
        <div className="mx-auto flex min-h-[440px] max-w-6xl flex-col justify-end px-4 pb-16 pt-40 text-background sm:min-h-[560px] md:justify-center md:pb-24 md:pt-24">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground"><MapPin className="size-3.5" />Lalamusa · Free home delivery</p>
          <h1 className="mt-3 max-w-xl font-display text-[2rem] font-bold leading-[1.05] sm:text-6xl">A Taste That You Will <span className="text-secondary">Remember</span></h1>
          <p className="mt-2 max-w-md text-sm opacity-90 sm:text-base">Hot pizzas, juicy burgers and family deals, baked fresh every day.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <a href="#track" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg"><PackageSearch className="size-4" />Track Order</a>
            <a href="#menu" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-background px-5 text-sm font-bold text-foreground">View Menu</a>
          </div>
        </div>
      </section>

      <section id="track" className="relative z-10 mx-auto -mt-10 max-w-3xl scroll-mt-28 px-3 sm:px-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl"><PackageSearch className="size-5 text-primary" />Track Order Live</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-whatsapp opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-whatsapp" /></span>Live</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Connected with our kitchen system. Enter the invoice number from your receipt.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (id.trim()) setTrackId(id.trim()); }} className="mt-3 flex gap-2">
            <input value={id} onChange={(e) => setId(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Invoice # e.g. 1005" className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-base" aria-label="Invoice number" />
            <button className="inline-flex h-12 shrink-0 items-center gap-1 rounded-xl bg-primary px-4 font-bold text-primary-foreground sm:px-5"><Search className="size-4" />Track</button>
          </form>
          {trackId && <OrderTracker id={trackId} />}
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Fresh from our kitchen</p>
          <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Check Out Our Digital Menu</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tap <b>WhatsApp Order</b> on any item and we will confirm it on WhatsApp.</p>
        </div>
        <div className="sticky top-[6.25rem] z-30 -mx-4 mt-6 bg-background/95 px-4 py-3 backdrop-blur md:top-16">
          <label className="relative mx-auto block max-w-xl"><Search className="absolute left-3.5 top-3.5 size-5 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pizza, burger, deal…" className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 shadow-sm" aria-label="Search menu" /></label>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => <button key={c.id} onClick={() => pick(c.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${cat === c.id ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>{c.label}</button>)}
          </div>
        </div>
        <div className="mt-6 space-y-12">
          {groups.map((g) => <MenuSection key={`${g.id}-${term}-${isMobile}`} id={g.id} items={g.items} isMobile={isMobile} />)}
        </div>
        {!groups.length && <p className="py-10 text-center text-muted-foreground">No items match your search.</p>}
      </section>

      <section id="contact" className="scroll-mt-16 border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Contact</p>
            <h2 className="mt-1 font-display text-3xl font-bold">Visit or call us</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent"><MapPin className="size-5 text-primary" /></span><span><b className="block">Address</b>{restaurantInfo.address}</span></li>
              <li className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent"><Clock className="size-5 text-primary" /></span><span><b className="block">Open daily</b>{restaurantInfo.hours}</span></li>
              <li className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent"><Bike className="size-5 text-primary" /></span><span><b className="block">Delivery</b>{restaurantInfo.delivery}</span></li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={whatsappLink("Assalam-o-alaikum Mimi’s Pizza, I want to place an order.")} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-xl bg-whatsapp px-5 font-bold text-whatsapp-foreground"><MessageCircle className="size-5" />WhatsApp</a>
              <a href={`tel:${CALL_NUMBER}`} className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-5 font-bold"><Phone className="size-5" />{restaurantInfo.phone}</a>
            </div>
          </div>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="group relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted text-center">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px]" />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform group-hover:-translate-y-1"><MapPin className="size-8" /></span>
            <p className="relative mt-3 font-bold">Mimi’s Pizza, Lalamusa</p>
            <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"><Navigation className="size-4" />Open in Google Maps</span>
          </a>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
