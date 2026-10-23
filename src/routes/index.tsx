import { createFileRoute } from "@tanstack/react-router";
import { addonsForProduct } from "@/lib/addons";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { emptyOverrides, publicMenu, type MenuOverrides } from "@/lib/menuOverrides";
import { Search, MapPin, Clock, Bike, Phone, PackageSearch, Pizza, ChevronDown, Navigation, MessageCircle } from "lucide-react";
import hero from "@/assets/golden-storefront.png.asset.json";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrderTracker } from "@/components/public/OrderTracker";
import { RatingChip } from "@/components/public/ReviewsSection";
import { Link } from "@tanstack/react-router";
import { categories, products, restaurantInfo, type CategoryId, type Product } from "@/data/menuData";
import { productImages } from "@/data/productImages";
import { logPublicEvent } from "@/lib/publicEvents";
import { CALL_NUMBER, MAPS_URL, whatsappLink } from "@/data/publicSite";
import { formatRs } from "@/lib/cart";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mimi’s Pizza Lalamusa — Digital Menu & Live Order Tracking" },
      { name: "description", content: "Mimi’s Pizza Lala Musa digital menu: pizza deals, burgers and fries with prices. Order on WhatsApp and track your delivery live." },
      { name: "keywords", content: "Mimi's Pizza, Mimis Pizza Lalamusa, pizza Lala Musa, pizza delivery Lalamusa, digital menu, order tracking" },
      { property: "og:url", content: "https://mimispizza.site/" },
      { property: "og:title", content: "Mimi’s Pizza Lalamusa — Digital Menu" },
      { property: "og:description", content: "Deals, pizzas and burgers. Order on WhatsApp and track your order live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mimispizza.site/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Restaurant", name: "Mimi’s Pizza", url: "https://mimispizza.site/", telephone: "+923124607733", servesCuisine: ["Pizza", "Burgers", "Fast food"], address: { "@type": "PostalAddress", streetAddress: "Main Qasba Road, Near Muhammadi Masjid", addressLocality: "Lalamusa", addressCountry: "PK" }, hasMenu: "https://mimispizza.site/#menu" }) }],
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

function sizeCode(s: string) {
  const t = s.toLowerCase();
  if (t.startsWith("extra") || t === "xl") return "XL";
  if (t.startsWith("small")) return "S";
  if (t.startsWith("medium")) return "M";
  if (t.startsWith("large")) return "L";
  return "";
}

function orderMessage(name: string, qty: number, price: number, size?: string, extras: string[] = []) {
  const code = size ? sizeCode(size) : "";
  const label = size ? ` ${size}${code ? ` (${code})` : ""}` : "";
  return `Assalam-o-alaikum Mimi’s Pizza! 🍕\n\nI want to order:\n*${qty}x ${name}${label}*\n${extras.length ? `Add-ons: ${extras.join(", ")}\n` : ""}Price: *${formatRs(price * qty)}*\n\nPlease confirm my order. Thank you!`;
}

function OrderModal({ p, name, onClose }: { p: Product; name: string; onClose: () => void }) {
  const sizes = (p.sizes ?? []).filter((s) => s.price);
  const [size, setSize] = useState(sizes[0]?.size);
  const [qty, setQty] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const [showExtras, setShowExtras] = useState(false);
  const addons = addonsForProduct(p.id, p.category, size);
  const chosen = addons.filter((a) => extras.includes(a.name));
  const unit = (sizes.find((s) => s.size === size)?.price ?? p.price ?? 0) + chosen.reduce((t, a) => t + a.price, 0);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Order ${name}`} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-primary">WhatsApp Order</p><h3 className="mt-1 text-xl font-bold">{name}</h3></div>
          <button onClick={onClose} aria-label="Close" className="flex size-9 items-center justify-center rounded-full bg-muted text-lg">×</button>
        </div>
        {sizes.length > 0 && (
          <>
            <p className="mt-4 text-sm font-semibold">{p.category === "drinks" ? "Choose drink" : "Choose size"}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {sizes.map((s) => {
                const code = sizeCode(s.size);
                const on = s.size === size;
                return (
                  <button key={s.size} onClick={() => { setSize(s.size); setExtras((e) => e.filter((x) => !x.startsWith("Extra Topping"))); }} className={`flex items-center justify-between rounded-xl border-2 px-3 py-3 text-left ${on ? "border-primary bg-primary/10" : "border-border"}`}>
                    <span className="flex items-center gap-2">{code && <span className={`flex size-7 items-center justify-center rounded-full text-xs font-black ${on ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{code}</span>}<span className="text-sm font-semibold">{s.size}</span></span>
                    <span className="text-sm font-bold text-primary">{formatRs(s.price!)}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {addons.length > 0 && (
          <div className="mt-4">
            <button type="button" onClick={() => setShowExtras((v) => !v)} className="inline-flex h-9 items-center gap-1 rounded-full border border-primary px-3 text-xs font-bold text-primary">+ Add-ons {chosen.length ? `(${chosen.length})` : ""}</button>
            {showExtras && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {addons.map((a) => {
                  const on = extras.includes(a.name);
                  return <button type="button" key={a.id} onClick={() => setExtras((e) => on ? e.filter((x) => x !== a.name) : [...e, a.name])} className={`flex items-center justify-between rounded-xl border-2 px-3 py-2 text-left text-xs ${on ? "border-primary bg-primary/10" : "border-border"}`}><span className="font-semibold">{a.name}</span><span className="font-bold text-primary">+{formatRs(a.price)}</span></button>;
                })}
              </div>
            )}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-semibold">Quantity</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="size-9 rounded-full border border-border text-lg font-bold" aria-label="Decrease">−</button>
            <span className="w-6 text-center font-bold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="size-9 rounded-full border border-border text-lg font-bold" aria-label="Increase">+</button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-muted px-4 py-3"><span className="text-sm">Total</span><span className="text-lg font-bold text-primary">{formatRs(unit * qty)}</span></div>
        <a href={whatsappLink(orderMessage(name, qty, unit, size, chosen.map((a) => a.name)))} target="_blank" rel="noopener noreferrer" onClick={() => { logPublicEvent("whatsapp_order", `${qty}x ${name}${size ? ` ${size}` : ""}`, unit * qty); onClose(); }} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp font-bold text-whatsapp-foreground"><WhatsAppIcon className="size-5" />Send order on WhatsApp</a>
      </div>
    </div>
  );
}

function MenuCard({ p, image }: { p: Product; image?: string | undefined }) {
  const img = image ?? productImages[p.id];
  const name = p.tag && !["Regular", "Special", "Signature"].includes(p.tag) ? `${p.name} ${p.tag}` : p.name;
  const [open, setOpen] = useState(false);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="overflow-hidden">
        {img ? <img src={img} alt={name} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex aspect-[4/3] items-center justify-center bg-muted"><Pizza className="size-10 text-muted-foreground" /></div>}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-sm font-bold leading-tight sm:text-base">{p.tag ? `${p.name} ${p.tag}` : p.name}</h3>
        {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
        <p className="mt-auto pt-2 text-sm font-bold text-primary sm:text-base">{priceOf(p)}</p>
        <button onClick={() => setOpen(true)} className="mt-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-whatsapp text-xs font-bold text-whatsapp-foreground sm:text-sm"><WhatsAppIcon className="size-4" />WhatsApp Order</button>
      </div>
      {open && <OrderModal p={p} name={name} onClose={() => setOpen(false)} />}
    </article>
  );
}

function MenuSection({ id, items, isMobile, images }: { id: CategoryId; items: Product[]; isMobile: boolean; images?: Record<string, string> | undefined }) {
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
      {id === "pizza" ? (
        <div className="space-y-6">
          {[...new Set(items.map((p) => p.tag ?? "Other"))].map((t) => (
            <div key={t}>
              <h4 className="mb-3 inline-flex rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">{t} Pizza</h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{items.filter((p) => (p.tag ?? "Other") === t).map((p) => <MenuCard key={p.id} p={p} image={images?.[p.id]} />)}</div>
            </div>
          ))}
        </div>
      ) : <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{visible.map((p) => <MenuCard key={p.id} p={p} image={images?.[p.id]} />)}</div>}
      {id !== "pizza" && items.length > visible.length && (
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
  const [overrides, setOverrides] = useState<MenuOverrides>(emptyOverrides);
  useEffect(() => { if (!sessionStorage.getItem("mp_v")) { sessionStorage.setItem("mp_v", "1"); logPublicEvent("visit", "home"); } }, []);
  useEffect(() => { supabase.rpc("public_menu_overrides").then(({ data }) => { if (data) setOverrides({ ...emptyOverrides, ...(data as unknown as MenuOverrides) }); }); }, []);
  const menu = useMemo(() => publicMenu(products, overrides), [overrides]);
  const term = q.trim().toLowerCase();
  const groups = useMemo(() => {
    const ids = categories.filter((c) => c.id !== "all").map((c) => c.id as CategoryId);
    return ids
      .filter((c) => cat === "all" || c === cat)
      .map((c) => ({ id: c, items: menu.filter((p) => p.category === c && (!term || `${p.name} ${p.tag ?? ""} ${p.description ?? ""}`.toLowerCase().includes(term))) }))
      .filter((g) => g.items.length);
  }, [cat, term, menu]);

  const pick = (c: CategoryId | "all") => {
    setCat(c);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="h-dvh overflow-y-auto scroll-smooth bg-background">
      <PublicHeader />

      <section className="relative isolate overflow-hidden">
        <img src={hero.url} alt="Mimi’s Pizza shop front in Lalamusa" width={1672} height={940} className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_30%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/20 max-md:bg-gradient-to-t max-md:from-foreground/95 max-md:via-foreground/60 max-md:to-foreground/10" />
        <div className="mx-auto flex min-h-[440px] max-w-6xl flex-col justify-end px-4 pb-16 pt-40 text-background sm:min-h-[560px] md:justify-center md:pb-24 md:pt-24">
          <RatingChip />
          <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground"><MapPin className="size-3.5" />Lalamusa · Free home delivery</p>
          <h1 className="mt-3 max-w-xl font-display text-[2rem] font-bold leading-[1.05] sm:text-6xl">A Taste That You Will <span className="text-secondary">Remember</span></h1>
          <p className="mt-2 max-w-md text-sm opacity-90 sm:text-base">Hot pizzas, juicy burgers and family deals, baked fresh every day.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <a href="#track" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg"><PackageSearch className="size-4" />Track Order</a>
            <a href="#menu" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-background px-5 text-sm font-bold text-foreground">View Menu</a>
            <Link to="/reviews" className="col-span-2 inline-flex h-11 items-center justify-center rounded-full border border-background/40 px-5 text-sm font-bold sm:col-span-1 sm:h-12">View Reviews</Link>
          </div>
        </div>
      </section>

      <section id="track" className="relative z-10 mx-auto -mt-10 max-w-3xl scroll-mt-28 px-3 sm:px-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl"><PackageSearch className="size-5 text-primary" />Track Order Live</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-whatsapp opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-whatsapp" /></span>Live</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Connected with our POS system. Enter the invoice number from your receipt.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (id.trim()) { setTrackId(id.trim()); logPublicEvent("track_search", id.trim()); } }} className="mt-3 flex gap-2">
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
        <div className="sticky top-[5.2rem] z-30 -mx-4 mt-6 bg-background/95 px-4 py-3 backdrop-blur md:top-[5.5rem]">
          <label className="relative mx-auto block max-w-xl"><Search className="absolute left-3.5 top-3.5 size-5 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pizza, burger, deal…" className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 shadow-sm" aria-label="Search menu" /></label>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => <button key={c.id} onClick={() => pick(c.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${cat === c.id ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>{c.label}</button>)}
          </div>
        </div>
        <div className="mt-6 space-y-12">
          {groups.map((g) => <MenuSection images={overrides.images} key={`${g.id}-${term}-${isMobile}`} id={g.id} items={g.items} isMobile={isMobile} />)}
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
