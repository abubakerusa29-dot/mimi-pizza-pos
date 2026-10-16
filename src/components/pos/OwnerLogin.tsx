import { useEffect, useState, type ReactNode } from "react";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import badge from "@/assets/mimis-primary-logo.png.asset.json";

/** Locks the POS behind the owner email and password login. */
export function OwnerLoginGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setState(data.session ? "in" : "out"));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setState(s ? "in" : "out"));
    return () => data.subscription.unsubscribe();
  }, []);
  if (state === "loading") return <div className="flex h-dvh items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  if (state === "out") return <LoginForm />;
  return <>{children}</>;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setErr("Wrong email or password. Please try again.");
  };
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-xl">
        <div className="text-center">
          <img src={badge.url} alt="Mimi’s Pizza" className="mx-auto size-20 object-contain" />
          <h1 className="mt-2 font-display text-xl font-bold">Owner & Staff Terminal</h1>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" />Authorised staff only</p>
        </div>
        <label className="grid gap-1 text-xs font-medium">Email<Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="grid gap-1 text-xs font-medium">Password<Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {err && <p className="text-xs text-destructive">{err}</p>}
        <Button type="submit" className="h-11 w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : "Sign in"}</Button>
        <a href="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Back to website</a>
      </form>
    </div>
  );
}

/** Settings card: owner changes login email and password. */
export function OwnerAccountCard() {
  const [email, setEmail] = useState("");
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "")); }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(undefined);
    const { data } = await supabase.auth.getUser();
    const oldEmail = data.user?.email ?? "";
    if (pw && (pw.length < 8 || pw !== pw2)) return setMsg({ ok: false, text: "New password must be 8+ characters and both boxes must match." });
    const check = await supabase.auth.signInWithPassword({ email: oldEmail, password: current });
    if (check.error) return setMsg({ ok: false, text: "Current password is wrong." });
    const update: { email?: string; password?: string } = {};
    if (email.trim() && email.trim() !== oldEmail) update.email = email.trim();
    if (pw) update.password = pw;
    if (!Object.keys(update).length) return setMsg({ ok: false, text: "Nothing to change." });
    const { error } = await supabase.auth.updateUser(update);
    if (error) return setMsg({ ok: false, text: error.message });
    setCurrent(""); setPw(""); setPw2("");
    setMsg({ ok: true, text: update.email ? "Saved. Check the new email inbox to confirm the change." : "Password changed." });
  };
  return (
    <form onSubmit={save} className="rounded-xl border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Lock className="size-4 text-primary" />Owner login (email and password)</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Login email<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Current password<Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className="text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">New password (optional)<Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Repeat new password<Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="text-sm text-foreground" /></label>
      </div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" size="sm">Save login</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    </form>
  );
}
