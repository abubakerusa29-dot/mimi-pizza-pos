import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, Eye, EyeOff, Trash2, BadgeCheck, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ratingSummary } from "@/lib/reviews";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/customer-reviews")({
  head: () => ({ meta: [{ title: "Customer Reviews — Mimi’s Pizza POS" }, { name: "description", content: "Reply to, hide or feature customer reviews." }, { property: "og:title", content: "Customer Reviews — Mimi’s Pizza POS" }, { property: "og:description", content: "Manage customer reviews." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ReviewsAdmin,
});

interface Row { id: string; created_at: string; name: string; phone: string; invoice_no: string; rating: number; comment: string; hidden: boolean; starred: boolean; reply: string; service: string }

function ReviewsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<string>();
  const load = () => supabase.from("reviews").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows((data as Row[] | null) ?? []));
  useEffect(() => { void load(); }, []);
  const update = async (id: string, patch: Partial<Row>) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    await supabase.from("reviews").update(patch).eq("id", id);
  };
  const remove = async (id: string) => { await supabase.from("reviews").delete().eq("id", id); setConfirm(undefined); void load(); };
  const s = ratingSummary(rows.filter((r) => !r.hidden).map((r) => r.rating));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-2xl font-bold">Customer Reviews</h2><p className="text-sm text-muted-foreground">Reply, hide bad reviews, or star the best ones to show them first.</p></div>
        <div className="rounded-xl border border-border bg-card px-4 py-2 text-sm"><b className="text-lg">{s.average.toFixed(1)}</b> ★ public rating · {rows.length} new reviews</div>
      </div>
      {rows.length === 0 && <p className="mt-10 text-center text-muted-foreground">No reviews yet.</p>}
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {rows.map((r) => (
          <article key={r.id} className={`rounded-2xl border bg-card p-4 ${r.hidden ? "opacity-60" : ""} ${r.starred ? "border-primary" : "border-border"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">{r.name} <span className="text-secondary">{"★".repeat(r.rating)}</span></p>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-GB")}</span>
            </div>
            <p className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Phone className="size-3" />{r.phone}</span>{r.invoice_no && <span className="inline-flex items-center gap-1"><BadgeCheck className="size-3" />Invoice #{r.invoice_no}</span>}{r.service && <span>{r.service}</span>}{r.hidden && <b className="text-destructive">Hidden from public</b>}</p>
            <p className="mt-2 text-sm">{r.comment}</p>
            <textarea rows={2} maxLength={500} placeholder="Write a reply (shows publicly under the review)" value={drafts[r.id] ?? r.reply} onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })} className="mt-3 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" disabled={(drafts[r.id] ?? r.reply) === r.reply} onClick={() => update(r.id, { reply: (drafts[r.id] ?? "").trim() })}>Save reply</Button>
              <Button size="sm" variant="outline" onClick={() => update(r.id, { starred: !r.starred })}><Star className={`size-4 ${r.starred ? "fill-primary text-primary" : ""}`} />{r.starred ? "Starred" : "Star"}</Button>
              <Button size="sm" variant="outline" onClick={() => update(r.id, { hidden: !r.hidden })}>{r.hidden ? <><Eye className="size-4" />Show</> : <><EyeOff className="size-4" />Hide</>}</Button>
              {confirm === r.id
                ? <><Button size="sm" variant="destructive" onClick={() => remove(r.id)}>Yes, delete</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(undefined)}>Cancel</Button></>
                : <Button size="sm" variant="ghost" onClick={() => setConfirm(r.id)}><Trash2 className="size-4" />Delete</Button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
