import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { verifyStaffPin } from "@/lib/staffPin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Owner-only: wipes all orders, reviews, customers, expenses, riders and stock counts after PIN + password + typed confirmation. */
export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const run = async () => {
    setMsg("");
    if (word.trim().toUpperCase() !== "DELETE") return setMsg("Type DELETE to confirm.");
    setBusy(true);
    try {
      const p = await verifyStaffPin({ data: { pin } });
      if (!p.ok) return setMsg(p.message || "Wrong PIN.");
      const { data } = await supabase.auth.getUser();
      const check = await supabase.auth.signInWithPassword({ email: data.user?.email ?? "", password });
      if (check.error) return setMsg("Wrong password.");
      const { error } = await supabase.rpc("reset_all_data");
      if (error) return setMsg("Could not clear data. Please try again.");
      setMsg("All data cleared. Reloading…");
      setTimeout(() => window.location.reload(), 900);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive"><AlertTriangle className="size-4" />Danger zone</h3>
      <p className="mt-1 text-xs text-muted-foreground">Clear all test data: orders, invoices, reviews, customers, expenses, riders and stock counts. Menu, prices, tables, team, receipt design and logins stay. This cannot be undone.</p>
      {!open ? (
        <Button variant="destructive" size="sm" className="mt-3" onClick={() => setOpen(true)}><Trash2 className="size-4" />Clear all data</Button>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Input type="password" inputMode="numeric" maxLength={6} placeholder="Staff PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} aria-label="Staff PIN" />
          <Input type="password" placeholder="Owner password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Owner password" />
          <Input placeholder="Type DELETE" value={word} onChange={(e) => setWord(e.target.value)} aria-label="Type DELETE to confirm" />
          <div className="flex gap-2 sm:col-span-3">
            <Button variant="destructive" size="sm" disabled={busy || pin.length !== 6 || !password} onClick={run}>{busy ? "Checking…" : "Yes, delete everything"}</Button>
            <Button variant="outline" size="sm" onClick={() => { setOpen(false); setMsg(""); }}>Cancel</Button>
          </div>
        </div>
      )}
      {msg && <p className="mt-2 text-xs font-semibold text-destructive">{msg}</p>}
    </section>
  );
}
