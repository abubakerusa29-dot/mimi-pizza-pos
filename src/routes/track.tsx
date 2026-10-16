import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ChefHat, Bike, PartyPopper, Search, ArrowLeft } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/data/publicSite";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => {
    const v = s["id"];
    return typeof v === "string" || typeof v === "number" ? { id: String(v) } : {};
  },
  head: () => ({
    meta: [
      { title: "Track Your Order — Mimi’s Pizza Lalamusa" },
      { name: "description", content: "Enter your Mimi’s Pizza tracking ID to see your order status live." },
      { property: "og:title", content: "Track Your Order — Mimi’s Pizza" },
      { property: "og:description", content: "See when your pizza is in the oven, on the way and delivered." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

type Found = { order_no: number; order_type: string; status: string | null; created_at: string; rider: string | null };

/** 0 confirmed, 1 preparing, 2 on the way, 3 delivered */
export function stageOf(o: Pick<Found, "status" | "created_at">, now = Date.now()): number {
  if (o.status === "Delivered" || o.status === "Cash returned") return 3;
  if (o.status === "On the way") return 2;
  return now - new Date(o.created_at).getTime() > 60_000 ? 1 : 0;
}

const steps = [
  { label: "Order confirmed", icon: CheckCircle2 },
  { label: "Preparing in the kitchen", icon: ChefHat },
  { label: "On the way", icon: Bike },
  { label: "Delivered", icon: PartyPopper },
];

function TrackPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(id ?? "");
  const [order, setOrder] = useState<Found | null | "none">(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return setOrder(null);
    let live = true;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("pos_invoices").select("order_no, order_type, status, created_at, rider").eq("order_no", Number(id)).neq("order_type", "Dine-in").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (live) { setOrder(data ?? "none"); setLoading(false); }
    };
    load();
    const t = setInterval(load, 20_000);
    return () => { live = false; clearInterval(t); };
  }, [id]);

  const stage = order && order !== "none" ? stageOf(order) : -1;
  const placed = order && order !== "none" ? new Date(order.created_at) : null;
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-dvh overflow-y-auto bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/menu" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Back to menu</Link>
        <h1 className="mt-3 font-display text-3xl font-bold">Track your order</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tracking is available for Delivery and Takeaway orders.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) navigate({ to: "/track", search: { id: input.trim() } }); }} className="mt-4 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Tracking ID from your receipt" aria-label="Tracking ID" className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-base" />
          <button className="inline-flex h-12 items-center gap-1 rounded-xl bg-primary px-5 font-bold text-primary-foreground"><Search className="size-4" />Track</button>
        </form>

        {loading && order === null && <p className="mt-8 text-center text-muted-foreground">Finding your order…</p>}
        {order === "none" && <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center"><p className="font-bold">Order not found</p><p className="mt-1 text-sm text-muted-foreground">Please check the Tracking ID on your receipt, or contact us on WhatsApp.</p><a href={whatsappLink(`Assalam-o-alaikum, I want to check my order #${id}`)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">Ask on WhatsApp</a></div>}

        {order && order !== "none" && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="bg-primary/10 p-6 text-center">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Order #{order.order_no} · {order.order_type}</p>
              <div className="track-anim mx-auto my-4 flex size-28 items-center justify-center rounded-full bg-card shadow-inner">
                {stage <= 1 && <ChefHat className="track-cook size-14 text-primary" />}
                {stage === 2 && <Bike className="track-ride size-14 text-primary" />}
                {stage === 3 && <PartyPopper className="track-pop size-14 text-primary" />}
              </div>
              <h2 className="font-display text-2xl font-bold">{["We got your order!", "Your pizza is being prepared", order.order_type === "Delivery" ? "Your food is on the way!" : "Your order is ready", "Delivered. Enjoy your meal!"][stage]}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{["The kitchen is starting now.", "Our chef is cooking it fresh in the oven.", order.rider ? `Rider ${order.rider} is coming. Arriving in about 5 to 7 minutes.` : "Arriving in about 5 to 7 minutes.", "Thank you for choosing Mimi’s Pizza."][stage]}</p>
            </div>
            <ol className="p-6">
              {steps.map((s, i) => {
                const done = i <= stage;
                const Icon = s.icon;
                return (
                  <li key={s.label} className="relative flex gap-3 pb-6 last:pb-0">
                    {i < steps.length - 1 && <span className={`absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5 ${i < stage ? "bg-primary" : "bg-border"}`} />}
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${i === stage && stage < 3 ? "animate-pulse" : ""}`}><Icon className="size-5" /></span>
                    <div><p className={`font-semibold ${done ? "" : "text-muted-foreground"}`}>{s.label}</p><p className="text-xs text-muted-foreground">{i === 0 && placed ? fmt(placed) : done ? "Done" : i === stage + 1 ? "Next" : "Waiting"}</p></div>
                  </li>
                );
              })}
            </ol>
            <p className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">This page updates automatically.</p>
          </section>
        )}
      </main>
    </div>
  );
}
