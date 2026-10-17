import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star, BadgeCheck, MessageSquareQuote, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ratingSummary, type PublicReview } from "@/lib/reviews";

export function Stars({ value, onPick, size = "size-4" }: { value: number; onPick?: (n: number) => void; size?: string }) {
  return (
    <div className="flex gap-0.5" role={onPick ? "radiogroup" : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onPick} onClick={() => onPick?.(n)} aria-label={`${n} star`} className={onPick ? "p-0.5" : "cursor-default"}>
          <Star className={`${onPick ? "size-8" : size} ${n <= Math.round(value) ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

export function usePublicReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const load = () => supabase.rpc("public_reviews").then(({ data }) => setReviews((data as PublicReview[] | null) ?? []));
  useEffect(() => { void load(); }, []);
  return { reviews, reload: load, summary: ratingSummary(reviews.map((r) => r.rating)) };
}

/** Small rating badge with a link to the reviews page (used in the homepage hero). */
export function RatingChip() {
  const { summary } = usePublicReviews();
  return (
    <Link to="/reviews" className="inline-flex w-fit items-center gap-2 rounded-full bg-background/15 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-background/25">
      <Star className="size-4 fill-secondary text-secondary" /><b className="text-sm">{summary.average.toFixed(1)}</b> rated by {summary.count}+ customers · <span className="underline">View reviews</span>
    </Link>
  );
}

const services = ["Delivery", "Takeaway", "Dine-in"] as const;

export function ReviewsPageContent() {
  const { reviews, reload, summary } = usePublicReviews();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", invoice: "", comment: "", service: "" });
  const [rating, setRating] = useState(5);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 2 || f.phone.replace(/\D/g, "").length < 7 || f.comment.trim().length < 3) return setMsg("Please write your name, phone number and a short review.");
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({ name: f.name.trim().slice(0, 60), phone: f.phone.trim().slice(0, 20), invoice_no: f.invoice.replace(/\D/g, "").slice(0, 12), rating, comment: f.comment.trim().slice(0, 500), service: f.service });
    setBusy(false);
    if (error) return setMsg("Could not send your review. Please try again.");
    setMsg("Shukriya! Your review has been added.");
    setF({ name: "", phone: "", invoice: "", comment: "", service: "" });
    setRating(5);
    setOpen(false);
    void reload();
  };

  const input = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:border-primary";
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="flex flex-col gap-5 rounded-3xl bg-foreground p-6 text-background sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Customer reviews</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">What our customers say</h1>
          <div className="mt-3 flex items-center gap-3"><span className="font-display text-5xl font-bold">{summary.average.toFixed(1)}</span><div><Stars value={summary.average} size="size-5" /><p className="mt-1 text-sm opacity-80">from {summary.count}+ customer ratings</p></div></div>
        </div>
        <button onClick={() => { setOpen(!open); setMsg(""); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground"><MessageSquareQuote className="size-4" />Write a review</button>
      </div>
      {msg && <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm font-medium">{msg}</p>}
      {open && (
        <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><p className="mb-1 text-sm font-semibold">Your rating</p><Stars value={rating} onPick={setRating} /></div>
          <input className={input} placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} aria-label="Your name" />
          <input className={input} placeholder="Phone number" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={20} aria-label="Phone number" />
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {services.map((s) => <button type="button" key={s} onClick={() => setF({ ...f, service: f.service === s ? "" : s })} className={`rounded-full px-4 py-2 text-sm font-semibold ${f.service === s ? "bg-primary text-primary-foreground" : "border border-border"}`}>{s}</button>)}
          </div>
          <input className={`${input} sm:col-span-2`} placeholder="Invoice number (optional, gets a Verified badge)" inputMode="numeric" value={f.invoice} onChange={(e) => setF({ ...f, invoice: e.target.value })} maxLength={12} aria-label="Invoice number" />
          <textarea className={`${input} sm:col-span-2`} rows={3} placeholder="How was your food and service?" value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} maxLength={500} aria-label="Your review" />
          <p className="text-xs text-muted-foreground sm:col-span-2">Your phone number is never shown publicly. Add the invoice number from your receipt to get a Verified order badge.</p>
          <button disabled={busy} className="h-12 rounded-full bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60 sm:col-span-2">{busy ? "Sending..." : "Submit review"}</button>
        </form>
      )}
      {reviews.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/30 p-8 text-center">
          <p className="font-display text-xl font-bold">Be the first to write a review</p>
          <p className="mt-1 text-sm text-muted-foreground">Tried our pizza? Tell others how it was.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article key={r.id} className={`rounded-2xl border bg-card p-4 shadow-sm ${r.starred ? "border-primary" : "border-border"}`}>
              <div className="flex items-center justify-between"><Stars value={r.rating} /><span className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-GB")}</span></div>
              <p className="mt-2 text-sm">{r.comment}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold">{r.name}
                {r.verified && <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary"><BadgeCheck className="size-3.5" />Verified order</span>}
                {r.service && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold">{r.service}</span>}
              </p>
              {r.reply && <div className="mt-3 rounded-xl bg-accent p-3 text-xs"><p className="flex items-center gap-1 font-bold"><Store className="size-3.5 text-primary" />Reply from Mimi’s Pizza</p><p className="mt-1">{r.reply}</p></div>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
