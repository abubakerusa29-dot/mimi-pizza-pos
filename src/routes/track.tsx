import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { OrderTracker } from "@/components/public/OrderTracker";

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

function TrackPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(id ?? "");
  return (
    <div className="min-h-dvh overflow-y-auto bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Back to home</Link>
        <h1 className="mt-3 font-display text-3xl font-bold">Track your order</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tracking is available for Delivery and Takeaway orders.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) navigate({ to: "/track", search: { id: input.trim() } }); }} className="mt-4 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Tracking ID from your receipt" aria-label="Tracking ID" className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-base" />
          <button className="inline-flex h-12 items-center gap-1 rounded-xl bg-primary px-5 font-bold text-primary-foreground"><Search className="size-4" />Track</button>
        </form>
        <OrderTracker id={id} />
      </main>
      <PublicFooter />
    </div>
  );
}
