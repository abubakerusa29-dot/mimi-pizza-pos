import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, LogOut, MessageCircle, PackageSearch, Wallet } from "lucide-react";

export const Route = createFileRoute("/pizza/50200")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Performance | Mimi’s Pizza" },
      { name: "description", content: "Private performance overview." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Performance | Mimi’s Pizza" },
      { property: "og:description", content: "Private performance overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SecretDashboard,
});

const OWNER = "abubakerusa29@gmail.com";
type Ev = { id: string; created_at: string; kind: string; label: string; amount: number };

function SecretDashboard() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  if (email === undefined) return <div className="grid h-dvh place-items-center text-muted-foreground">Loading…</div>;
  if (email?.toLowerCase() !== OWNER) return <Login signedInOther={!!email} />;
  return <Stats />;
}

function Login({ signedInOther }: { signedInOther: boolean }) {
  const [e, setE] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [show, setShow] = useState(false);
  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setBusy(true); setErr("");
    if (e.trim().toLowerCase() !== OWNER) { setErr("Wrong email or password."); setBusy(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: e.trim(), password: p });
    if (error) setErr("Wrong email or password.");
    setBusy(false);
  };
  return (
    <div className="grid h-dvh place-items-center bg-muted p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h1 className="text-xl font-bold">Private dashboard</h1>
        {signedInOther && <p className="text-xs text-muted-foreground">This account cannot open this page. Sign in with the owner email.</p>}
        <input type="email" required value={e} onChange={(x) => setE(x.target.value)} placeholder="Email" className="h-11 w-full rounded-xl border border-input bg-background px-3" />
        <div className="relative">
          <input type={show ? "text" : "password"} required value={p} onChange={(x) => setP(x.target.value)} placeholder="Password" className="h-11 w-full rounded-xl border border-input bg-background px-3 pr-11" />
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={busy} className="h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground">{busy ? "Signing in…" : "Sign in"}</button>
        {signedInOther && <button type="button" onClick={() => supabase.auth.signOut()} className="w-full text-sm text-muted-foreground underline">Sign out the other account first</button>}
      </form>
    </div>
  );
}

const RANGES = [{ id: 1, l: "Today" }, { id: 7, l: "7 days" }, { id: 30, l: "30 days" }, { id: 365, l: "All" }];

function Stats() {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<Ev[]>([]);
  useEffect(() => {
    const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - (days - 1));
    supabase.from("public_events").select("*").gte("created_at", from.toISOString()).order("created_at", { ascending: false }).limit(5000)
      .then(({ data }) => setRows((data as Ev[]) ?? []));
  }, [days]);
  const s = useMemo(() => {
    const by = (k: string) => rows.filter((r) => r.kind === k);
    const orders = by("whatsapp_order");
    const top = Object.entries(orders.reduce<Record<string, number>>((a, r) => { const n = r.label.replace(/^\d+x /, ""); a[n] = (a[n] ?? 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { visits: by("visit").length, orders: orders.length, value: orders.reduce((a, r) => a + r.amount, 0), tracks: by("track_search").length, top };
  }, [rows]);
  const label: Record<string, string> = { visit: "Visit", whatsapp_order: "WhatsApp order", track_search: "Track search" };
  return (
    <div className="min-h-dvh bg-muted">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Mimi’s Pizza · Performance</h1>
        <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1 text-sm text-muted-foreground"><LogOut className="size-4" />Sign out</button>
      </header>
      <main className="mx-auto max-w-5xl space-y-5 p-4">
        <div className="flex gap-2">{RANGES.map((r) => <button key={r.id} onClick={() => setDays(r.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${days === r.id ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>{r.l}</button>)}</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card icon={<Eye className="size-5" />} t="Digital menu visits" v={s.visits} />
          <Card icon={<MessageCircle className="size-5" />} t="WhatsApp orders" v={s.orders} />
          <Card icon={<Wallet className="size-5" />} t="Order value (Rs.)" v={s.value.toLocaleString()} />
          <Card icon={<PackageSearch className="size-5" />} t="Order tracking searches" v={s.tracks} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-2 font-bold">Most ordered items</h2>
            {s.top.length ? s.top.map(([n, c]) => <div key={n} className="flex justify-between border-b border-border py-1.5 text-sm"><span>{n}</span><b>{c}</b></div>) : <p className="text-sm text-muted-foreground">No orders yet.</p>}
          </section>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-2 font-bold">Recent activity</h2>
            <div className="max-h-80 overflow-y-auto">
              {rows.filter((r) => r.kind !== "visit").slice(0, 50).map((r) => <div key={r.id} className="flex justify-between gap-2 border-b border-border py-1.5 text-sm"><span><b>{label[r.kind]}</b> {r.label}</span><span className="shrink-0 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span></div>)}
              {!rows.some((r) => r.kind !== "visit") && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            </div>
          </section>
        </div>
        <p className="text-xs text-muted-foreground">Counting started today. WhatsApp orders mean the customer tapped “Send order on WhatsApp”.</p>
      </main>
    </div>
  );
}

function Card({ icon, t, v }: { icon: React.ReactNode; t: string; v: string | number }) {
  return <div className="rounded-2xl border border-border bg-card p-4"><div className="text-primary">{icon}</div><p className="mt-2 text-2xl font-bold">{v}</p><p className="text-xs text-muted-foreground">{t}</p></div>;
}
