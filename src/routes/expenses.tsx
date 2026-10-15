import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRs } from "@/lib/cart";
import { expenseTypes, newId } from "@/lib/backOffice";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses | Mimi’s Pizza POS" }, { name: "description", content: "Record daily restaurant expenses with type, reason, amount and date." }, { property: "og:title", content: "Expenses | Mimi’s Pizza POS" }, { property: "og:description", content: "Daily expense book for Mimi’s Pizza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ExpensesPage,
});

const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function ExpensesPage() {
  const { backOffice, updateBackOffice } = useOrder();
  const [f, setF] = useState({ date: todayIso(), type: expenseTypes[0]!, reason: "", amount: "" });
  const [month, setMonth] = useState(todayIso().slice(0, 7));
  const add = () => {
    const amount = Number(f.amount);
    if (!amount || amount <= 0) return;
    updateBackOffice({ expenses: [{ id: newId(), date: f.date, type: f.type, reason: f.reason.trim(), amount }, ...backOffice.expenses] });
    setF({ ...f, reason: "", amount: "" });
  };
  const list = backOffice.expenses.filter((e) => !month || e.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date));
  const total = list.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
      <div><h2 className="font-display text-xl font-semibold">Expenses</h2><p className="text-xs text-muted-foreground">Write down every expense. Reports use these to show your profit.</p></div>
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Add an expense</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-[140px_170px_1fr_110px_auto]">
          <Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} aria-label="Date" />
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} aria-label="Expense type" className="h-9 rounded-md border border-input bg-background px-2 text-sm">{expenseTypes.map((t) => <option key={t}>{t}</option>)}</select>
          <Input value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="Reason, e.g. 20kg cheese" aria-label="Reason" />
          <Input value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} type="number" min={0} placeholder="Amount" aria-label="Amount" />
          <Button onClick={add}><Plus /> Add</Button>
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">Month <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" /></label>
        <p className="text-sm">Total: <b className="text-primary">{formatRs(total)}</b></p>
      </div>
      {list.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No expenses for this month.</p>}
      <div className="divide-y rounded-xl border bg-card">
        {list.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0"><p className="text-sm font-semibold">{e.type}{e.reason && <span className="font-normal text-muted-foreground"> · {e.reason}</span>}</p><p className="text-xs text-muted-foreground">{new Date(e.date + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></div>
            <div className="flex items-center gap-3"><b className="text-sm">{formatRs(e.amount)}</b><button onClick={() => { if (window.confirm("Delete this expense?")) updateBackOffice({ expenses: backOffice.expenses.filter((x) => x.id !== e.id) }); }} aria-label="Delete expense" className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}
