import React, { useEffect, useState, type ReactNode } from "react";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import badge from "@/assets/mimis-primary-logo.png.asset.json";
import { useServerFn } from "@tanstack/react-start";
import { getPinStatus, verifyStaffPin, changeStaffPin } from "@/lib/staffPin.functions";

/** Locks the POS behind the owner email and password login. */
export function OwnerLoginGate({ children }: { children: ReactNode }) {
  const status = useServerFn(getPinStatus);
  const [state, setState] = useState<"loading" | "in" | "out">("loading");
  const [pinOk, setPinOk] = useState(false);
  useEffect(() => {
    // Run the session check and PIN check in parallel so the screen opens fast.
    status().then((r) => { if (r.ok) setPinOk(true); }).catch(() => {});
    supabase.auth.getSession().then(({ data }) => setState(data.session ? "in" : "out"));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setState(s ? "in" : "out"));
    return () => data.subscription.unsubscribe();
  }, [status]);
  if (state === "in") return <>{children}</>;
  if (state === "loading") return <div className="flex h-dvh items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  return pinOk ? <LoginForm /> : <PinForm onOk={() => setPinOk(true)} />;
}

function PinForm({ onOk }: { onOk: () => void }) {
  const verify = useServerFn(verifyStaffPin);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { const r = await verify({ data: { pin } }); if (r.ok) onOk(); else { setErr(r.message); setPin(""); } }
    catch { setErr("Could not check the PIN. Please try again."); }
    setBusy(false);
  };
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-xl">
        <div className="text-center">
          <img src={badge.url} alt="Mimi’s Pizza" className="mx-auto size-20 object-contain" />
          <h1 className="mt-2 font-display text-xl font-bold">Staff PIN</h1>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" />Step 1 of 2. Enter the 6-digit staff PIN</p>
        </div>
        <SecretInput autoFocus value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="••••••" aria-label="Staff PIN" className="h-12 text-center text-xl tracking-[0.5em]" />
        {err && <p className="text-xs text-destructive">{err}</p>}
        <Button type="submit" className="h-11 w-full" disabled={busy || pin.length !== 6}>{busy ? <Loader2 className="animate-spin" /> : "Continue"}</Button>
        <a href="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Back to website</a>
      </form>
    </div>
  );
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
          <p className="text-xs text-muted-foreground">Step 2 of 2. Email and password</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" />Authorised staff only</p>
        </div>
        <label className="grid gap-1 text-xs font-medium">Email<Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="grid gap-1 text-xs font-medium">Password<SecretInput autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
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
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Current password<SecretInput value={current} onChange={(e) => setCurrent(e.target.value)} required className="text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">New password (optional)<SecretInput value={pw} onChange={(e) => setPw(e.target.value)} className="text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Repeat new password<SecretInput value={pw2} onChange={(e) => setPw2(e.target.value)} className="text-sm text-foreground" /></label>
      </div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" size="sm">Save login</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    </form>
  );
}

/** Settings card: owner changes the 6-digit staff PIN (needs current password). */
export function StaffPinCard() {
  const change = useServerFn(changeStaffPin);
  const [current, setCurrent] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(undefined);
    if (!/^\d{6}$/.test(pin) || pin !== pin2) return setMsg({ ok: false, text: "PIN must be 6 digits and both boxes must match." });
    const { data } = await supabase.auth.getUser();
    const check = await supabase.auth.signInWithPassword({ email: data.user?.email ?? "", password: current });
    if (check.error) return setMsg({ ok: false, text: "Current password is wrong." });
    const r = await change({ data: { pin } });
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) { setCurrent(""); setPin(""); setPin2(""); }
  };
  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 6);
  return (
    <form onSubmit={save} className="rounded-xl border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Lock className="size-4 text-primary" />Staff PIN (asked before login)</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Current password<SecretInput value={current} onChange={(e) => setCurrent(e.target.value)} required className="text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">New 6-digit PIN<SecretInput inputMode="numeric" value={pin} onChange={(e) => setPin(digits(e.target.value))} className="text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Repeat PIN<SecretInput inputMode="numeric" value={pin2} onChange={(e) => setPin2(digits(e.target.value))} className="text-sm text-foreground" /></label>
      </div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
      <Button type="submit" size="sm" className="mt-3">Change PIN</Button>
    </form>
  );
}

function SecretInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className={`${className ?? ""} pr-10`} />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide" : "Show"} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
