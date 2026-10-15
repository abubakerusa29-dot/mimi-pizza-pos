import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, UserRound } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { newId, teamRoles, type TeamMember } from "@/lib/backOffice";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team Members | Mimi’s Pizza POS" }, { name: "description", content: "Keep a list of staff with role, phone and shift." }, { property: "og:title", content: "Team Members | Mimi’s Pizza POS" }, { property: "og:description", content: "Staff list for Mimi’s Pizza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: TeamPage,
});

function TeamPage() {
  const { backOffice, updateBackOffice, riderList, setRiderList } = useOrder();
  const [f, setF] = useState({ name: "", role: "Cashier", phone: "", shift: "" });
  const team = backOffice.team;
  const set = (t: TeamMember[]) => updateBackOffice({ team: t });
  const add = () => {
    const name = f.name.trim();
    if (!name) return;
    set([...team, { id: newId(), name, role: f.role, phone: f.phone.trim(), shift: f.shift.trim(), active: true }]);
    // Riders added here also appear in the rider list for dispatch.
    if (f.role === "Rider" && !riderList.includes(name)) setRiderList([...riderList, name]);
    setF({ ...f, name: "", phone: "", shift: "" });
  };
  return (
    <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      <div><h2 className="font-display text-xl font-semibold">Team Members</h2><p className="text-xs text-muted-foreground">Keep a list of your staff. Members with the Rider role are added to the rider list automatically.</p></div>
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Add a team member</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_150px_1fr_1fr_auto]">
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Name" aria-label="Name" />
          <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} aria-label="Role" className="h-9 rounded-md border border-input bg-background px-2 text-sm">{teamRoles.map((r) => <option key={r}>{r}</option>)}</select>
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Phone" type="tel" aria-label="Phone" />
          <Input value={f.shift} onChange={(e) => setF({ ...f, shift: e.target.value })} placeholder="Shift, e.g. 4pm to 2am" aria-label="Shift" />
          <Button onClick={add}><Plus /> Add</Button>
        </div>
      </section>
      {team.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No team members yet.</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {team.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 rounded-xl border bg-card p-3 ${m.active ? "" : "opacity-60"}`}>
            <UserRound className="mt-0.5 size-8 shrink-0 rounded-full bg-accent p-1.5 text-primary" />
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{m.name} <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">{m.role}</span></p><p className="text-xs text-muted-foreground">{m.phone || "No phone"}{m.shift && ` · ${m.shift}`}</p>
              <button onClick={() => set(team.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)))} className="mt-1 text-xs font-medium text-primary">{m.active ? "Mark as left" : "Mark as working"}</button></div>
            <button onClick={() => { if (window.confirm(`Delete ${m.name}?`)) set(team.filter((x) => x.id !== m.id)); }} aria-label={`Delete ${m.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
