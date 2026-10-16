import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Clock, Bike, MessageCircle, Phone, PackageSearch, Pizza } from "lucide-react";
import hero from "@/assets/mimis-storefront.jpg.asset.json";
import { PublicHeader } from "@/components/public/PublicHeader";
import { categories, products, restaurantInfo, type CategoryId } from "@/data/menuData";
import { productImages } from "@/data/productImages";
import { CALL_NUMBER, whatsappLink } from "@/data/publicSite";
import { softwareCredit } from "@/data/softwareCredit";
import { formatRs } from "@/lib/cart";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Mimi’s Pizza Lalamusa — Digital Menu & Order Tracking" },
      { name: "description", content: "View Mimi’s Pizza menu, order on WhatsApp and track your delivery live in Lalamusa." },
      { property: "og:title", content: "Mimi’s Pizza Lalamusa — Digital Menu" },
      { property: "og:description", content: "Browse deals and pizzas, order on WhatsApp, and track your order live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicMenu,
});

function priceOf(p: (typeof products)[number]) {
  if (p.price) return formatRs(p.price);
  const s = p.sizes?.filter((x) => x.price)?.map((x) => x.price!) ?? [];
  return s.length ? `From ${formatRs(Math.min(...s))}` : "";
}

function PublicMenu() {
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [q, setQ] = useState("");
  const [id, setId] = useState("");
  const navigate = useNavigate();
  const list = useMemo(() => products.filter((p) => (cat === "all" || p.category === cat) && `${p.name} ${p.tag ?? ""} ${p.description ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())), [cat, q]);

  return (
    <div className="min-h-dvh overflow-y-auto bg-background">
      <PublicHeader />
      <section className="relative">
        <img src={hero.url} alt="Mimi’s Pizza shop front in Lalamusa" className="h-[360px] w-full object-cover sm:h-[460px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 text-background">
          <p className="flex items-center gap-1 text-sm font-semibold"><MapPin className="size-4" /> Lalamusa</p>
          <h1 className="mt-1 font-display text-4xl font-bold sm:text-6xl">A Taste That You Will Remember</h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base">Fresh pizzas, burgers and deals. Free home delivery under 3 km.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/track" className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Track Your Order Live</Link>
            <a href="#menu" className="rounded-full bg-background px-5 py-3 text-sm font-bold text-foreground">View Menu</a>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-6xl px-4">
        <form onSubmit={(e) => { e.preventDefault(); if (id.trim()) navigate({ to: "/track", search: { id: id.trim() } }); }} className="relative rounded-2xl border border-border bg-card p-5 shadow-lg">
          <h2 className="flex items-center gap-2 text-lg font-bold"><PackageSearch className="size-5 text-primary" /> Track your order</h2>
          <p className="mt-1 text-xs text-muted-foreground">Tracking is available for Delivery and Takeaway orders. Enter the Tracking ID printed on your receipt.</p>
          <div className="mt-3 flex gap-2">
            <input value={id} onChange={(e) => setId(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="e.g. 1024" className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-base" aria-label="Tracking ID" />
            <button className="h-12 rounded-xl bg-primary px-5 font-bold text-primary-foreground">Track</button>
          </div>
        </form>
      </section>

      <section id="menu" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="font-display text-3xl font-bold">Our Menu</h2><p className="text-sm text-muted-foreground">Tap “Order” to send it to us on WhatsApp.</p></div>
          <label className="relative sm:w-72"><Search className="absolute left-3 top-3 size-5 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search menu" className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3" /></label>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => <button key={c.id} onClick={() => setCat(c.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${cat === c.id ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>{c.label}</button>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => {
            const img = productImages[p.id];
            const name = p.tag ? `${p.name} ${p.tag}` : p.name;
            return (
              <article key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                {img ? <img src={img} alt={name} loading="lazy" className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center bg-muted"><Pizza className="size-10 text-muted-foreground" /></div>}
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="text-sm font-bold leading-tight">{name}</h3>
                  {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    <span className="text-sm font-bold text-primary">{priceOf(p)}</span>
                    <a href={whatsappLink(`Assalam-o-alaikum Mimi’s Pizza, I want to order: ${name}`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"><MessageCircle className="size-3.5" />Order</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!list.length && <p className="py-10 text-center text-muted-foreground">No items match your search.</p>}
      </section>

      <section id="contact" className="scroll-mt-20 border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">Order now</h2>
            <p className="mt-2 flex gap-2 text-sm"><MapPin className="size-4 shrink-0 text-primary" />{restaurantInfo.address}</p>
            <p className="mt-2 flex gap-2 text-sm"><Clock className="size-4 shrink-0 text-primary" />{restaurantInfo.hours}</p>
            <p className="mt-2 flex gap-2 text-sm"><Bike className="size-4 shrink-0 text-primary" />{restaurantInfo.delivery}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end sm:justify-center">
            <a href={whatsappLink("Assalam-o-alaikum Mimi’s Pizza, I want to place an order.")} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground"><MessageCircle className="size-5" />Order on WhatsApp</a>
            <a href={`tel:${CALL_NUMBER}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border px-6 font-bold"><Phone className="size-5" />Call {restaurantInfo.phone}</a>
          </div>
        </div>
        <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
          <p>This is Mimi’s Pizza digital menu and order tracking page. To place an order, please call or WhatsApp us.</p>
          <p className="mt-1">Made by <a href={softwareCredit.website} className="font-semibold text-primary">{softwareCredit.name}</a> · {softwareCredit.phone}</p>
        </div>
      </section>
    </div>
  );
}
