import { useEffect, useState } from "react";
import { Star, BadgeCheck, MessageSquareQuote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review { id: string; created_at: string; name: string; rating: number; comment: string; verified: boolean }

function Stars({ value, onPick }: { value: number; onPick?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5" role={onPick ? "radiogroup" : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onPick} onClick={() => onPick?.(n)} aria-label={`${n} star`} className={onPick ? "p-0.5" : "cursor-default"}>
          <Star className={`${onPick ? "size-8" : "size-4"} ${n <= value ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", invoice: "", comment: "" });
  const [rating, setRating] = useState(5);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => supabase.rpc("public_reviews").then(({ data }) => setReviews((data as Review[] | null) ?? []));
  useEffect(() => { void load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 2 || f.phone.replace(/\D/g, "").length < 7 || f.comment.trim().length < 3) return setMsg("Please write your name, phone number and a short review.");
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({ name: f.name.trim().slice(0, 60), phone: f.phone.trim().slice(0, 20), invoice_no: f.invoice.replace(/\D/g, "").slice(0, 12), rating, comment: f.comment.trim().slice(0, 500) });
    setBusy(false);
    if (error) return setMsg("Could not send your review. Please try again.");
    setMsg("Shukriya! Your review has been added.");
    setF({ name: "", phone: "", invoice: "", comment: "" });
    setRating(5);
    setOpen(false);
    void load();
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const input = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
  return (
    <section id="reviews" className="scroll-mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Reviews</p>
            <h2 className="mt-1 font-display text-3xl font-bold">What our customers say</h2>
            {reviews.length > 0 && <div className="mt-2 flex items-center gap-2 text-sm"><Stars value={Math.round(avg)} /><b>{avg.toFixed(1)}</b><span className="text-muted-foreground">from {reviews.length} reviews</span></div>}
          </div>
          <button onClick={() => { setOpen(!open); setMsg(""); }} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground"><MessageSquareQuote className="size-4" />Write a review</button>
        </div>
        {msg && <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm font-medium">{msg}</p>}
        {open && (
          <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><p className="mb-1 text-sm font-semibold">Your rating</p><Stars value={rating} onPick={setRating} /></div>
            <input className={input} placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} aria-label="Your name" />
            <input className={input} placeholder="Phone number" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={20} aria-label="Phone number" />
            <input className={`${input} sm:col-span-2`} placeholder="Invoice number (optional, gets a Verified badge)" inputMode="numeric" value={f.invoice} onChange={(e) => setF({ ...f, invoice: e.target.value })} maxLength={12} aria-label="Invoice number" />
            <textarea className={`${input} sm:col-span-2`} rows={3} placeholder="How was your food and service?" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} maxLength={500} aria-label="Your review" />
            <p className="text-xs text-muted-foreground sm:col-span-2">Your phone number is never shown publicly.</p>
            <button disabled={busy} className="h-11 rounded-full bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60 sm:col-span-2">{busy ? "Sending..." : "Submit review"}</button>
          </form>
        )}
        {reviews.length === 0 && !open ? (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/30 p-8 text-center">
            <p className="font-display text-xl font-bold">Be our first reviewer</p>
            <p className="mt-1 text-sm text-muted-foreground">Tried our pizza? Tell others how it was.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 9).map((r) => (
              <article key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between"><Stars value={r.rating} /><span className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-GB")}</span></div>
                <p className="mt-2 text-sm">{r.comment}</p>
                <p className="mt-3 flex items-center gap-1 text-sm font-bold">{r.name}{r.verified && <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary"><BadgeCheck className="size-3.5" />Verified order</span>}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
