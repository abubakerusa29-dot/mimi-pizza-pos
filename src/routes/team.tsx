import { confirmDialog } from "@/components/ConfirmDialog";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { newId, type TeamMember } from "@/lib/backOffice";
import { accessAreas, cashierAccess, isValidPin, rolePresets, staffRoles, type AccessKey } from "@/lib/staffAccess";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team Members | Mimi’s Pizza POS" }, { name: "description", content: "Create staff logins with PIN and choose what each person can use." }, { property: "og:title", content: "Team Members | Mimi’s Pizza POS" }, { property: "og:description", content: "Staff logins and access for Mimi’s Pizza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: TeamPage,
});

type Form = { id?: string; name: string; role: string; phone: string; shift: string; pin: string; permissions: AccessKey[] };
const blank = (): Form => ({ name: "", role: "Cashier", phone: "", shift: "", pin: "", permissions: [...cashierAccess] });

function TeamPage() {
  const { backOffice, updateBackOffice, riderList, setRiderList } = useOrder();
  const team = backOffice.team;
  const [f, setF] = useState<Form>(blank());
  const [err, setErr] = useState("");
  const [ownerPin, setOwnerPin] = useState("");
  const [ownerMsg, setOwnerMsg] = useState("");

  const pinUsed = (pin: string, id?: string) => pin === backOffice.ownerPin || team.some((t) => t.pin === pin && t.id !== id);
  const save = () => {
    const name = f.name.trim();
    if (!name) return setErr("Enter a name.");
    if (!isValidPin(f.pin)) return setErr("PIN must be 4 to 6 digits.");
    if (pinUsed(f.pin, f.id)) return setErr("This PIN is already used. Choose another.");
    const member: TeamMember = { id: f.id ?? newId(), name, role: f.role, phone: f.phone.trim(), shift: f.shift.trim(), pin: f.pin, permissions: f.permissions, active: team.find((t) => t.id === f.id)?.active ?? true };
    updateBackOffice({ team: f.id ? team.map((t) => (t.id === f.id ? member : t)) : [...team, member] });
    if (f.role === "Rider" && !riderList.includes(name)) setRiderList([...riderList, name]);
    setF(blank()); setErr("");
  };
  const toggle = (k: AccessKey) => setF({ ...f, permissions: f.permissions.includes(k) ? f.permissions.filter((p) => p !== k) : [...f.permissions, k] });
  const saveOwnerPin = () => {
    if (!isValidPin(ownerPin)) return setOwnerMsg("PIN must be 4 to 6 digits.");
    if (team.some((t) => t.pin === ownerPin)) return setOwnerMsg("A staff member already uses this PIN.");
    updateBackOffice({ ownerPin }); setOwnerPin(""); setOwnerMsg("Owner PIN saved. The app now asks for a PIN.");
  };

  const group = (g: "counter" | "owner") => accessAreas.filter((a) => a.group === g).map((a) => (
    <label key={a.key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.permissions.includes(a.key)} onChange={() => toggle(a.key)} className="size-4 accent-[var(--primary)]" />{a.label}</label>
  ));

  return (
    <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      <div><h2 className="font-display text-xl font-semibold">Team Members</h2><p className="text-xs text-muted-foreground">Make a login PIN for each staff member and choose what they can use. Staff can run the counter when you are away. Team and Settings stay owner only.</p></div>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="size-4 text-primary" /> Owner PIN</h3>
        <p className="mt-1 text-xs text-muted-foreground">{backOffice.ownerPin ? "Owner PIN is set. Enter a new one to change it." : "Not set yet. Until you set it, anyone can open every page."}</p>
        <div className="mt-3 flex gap-2"><Input value={ownerPin} onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, "").slice(0, 6))} type="password" inputMode="numeric" placeholder="4 to 6 digits" aria-label="Owner PIN" className="max-w-[200px]" /><Button onClick={saveOwnerPin}>{backOffice.ownerPin ? "Change PIN" : "Set PIN"}</Button></div>
        {ownerMsg && <p className="mt-2 text-xs text-muted-foreground">{ownerMsg}</p>}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">{f.id ? `Edit ${f.name}` : "Create staff login"}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Name" aria-label="Name" />
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value, permissions: [...(rolePresets[e.target.value] ?? [])] })} aria-label="Role" className="h-9 rounded-md border border-input bg-background px-2 text-sm">{staffRoles.map((r) => <option key={r}>{r}</option>)}</select>
          <Input value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" placeholder="Login PIN" aria-label="Login PIN" />
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Phone" type="tel" aria-label="Phone" />
          <Input value={f.shift} onChange={(e) => setF({ ...f, shift: e.target.value })} placeholder="Shift, e.g. 4pm to 2am" aria-label="Shift" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><p className="text-xs font-semibold uppercase text-muted-foreground">Counter work</p>{group("counter")}</div>
          <div className="space-y-2"><p className="text-xs font-semibold uppercase text-muted-foreground">Money and setup (usually owner only)</p>{group("owner")}</div>
        </div>
        {err && <p className="mt-3 text-xs text-destructive">{err}</p>}
        <div className="mt-4 flex gap-2"><Button onClick={save}><Plus /> {f.id ? "Save changes" : "Create login"}</Button>{f.id && <Button variant="outline" onClick={() => { setF(blank()); setErr(""); }}>Cancel</Button>}</div>
      </section>

      {team.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No team members yet.</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {team.map((m) => {
          const perms = (m.permissions ?? rolePresets[m.role] ?? []) as string[];
          return (
            <div key={m.id} className={`flex items-start gap-3 rounded-xl border bg-card p-3 ${m.active ? "" : "opacity-60"}`}>
              <UserRound className="mt-0.5 size-8 shrink-0 rounded-full bg-accent p-1.5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{m.name} <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">{m.role}</span></p>
                <p className="text-xs text-muted-foreground">{m.phone || "No phone"}{m.shift && ` · ${m.shift}`} · {m.pin ? "PIN set" : "No PIN"}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">{accessAreas.filter((a) => perms.includes(a.key)).map((a) => <span key={a.key} className={`rounded px-1.5 py-0.5 text-[10px] ${a.group === "owner" ? "bg-destructive/10 text-destructive" : "bg-accent"}`}>{a.label}</span>)}</div>
                <div className="mt-2 flex gap-3 text-xs font-medium text-primary">
                  <button onClick={() => { setF({ id: m.id, name: m.name, role: m.role, phone: m.phone, shift: m.shift, pin: m.pin ?? "", permissions: perms as AccessKey[] }); setErr(""); }} className="flex items-center gap-1"><Pencil className="size-3" /> Edit access</button>
                  <button onClick={() => updateBackOffice({ team: team.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)) })}>{m.active ? "Block login" : "Allow login"}</button>
                </div>
              </div>
              <button onClick={async () => { if (await confirmDialog(`Delete ${m.name}?`, { title: "Delete team member", confirmLabel: "Delete" })) updateBackOffice({ team: team.filter((x) => x.id !== m.id) }); }} aria-label={`Delete ${m.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
