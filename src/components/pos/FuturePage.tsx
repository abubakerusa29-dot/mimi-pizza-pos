import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock3, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FuturePage({ title, icon: Icon, summary, actions }: { title: string; icon: LucideIcon; summary?: string; actions?: string[] }) {
  const [notice, setNotice] = useState<string | null>(null);
  return <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6 sm:px-10">
    <div className="border-b border-border pb-5"><p className="text-xs font-medium text-muted-foreground">Mimi’s Pizza / Workspace</p><h2 className="mt-2 font-display text-2xl font-semibold">{title}</h2></div>
    <div className="m-auto flex w-full max-w-xl flex-col items-center py-12 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-lg bg-secondary"><Icon className="h-9 w-9 text-primary" /></div>
      <span className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Coming in final software</span>
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      {summary && <p className="mt-2 text-sm text-foreground">{summary}</p>}
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">This is a demo. This page will be added in the final software.</p>
      {actions && actions.length > 0 && <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
        {actions.map((a) => <Button key={a} variant="outline" className="h-12 justify-start" onClick={() => setNotice(`“${a}” will be available in the final software.`)}><Plus className="text-primary" /> {a}</Button>)}
      </div>}
      {notice && <p role="status" className="mt-4 rounded-md bg-secondary px-3 py-2 text-xs font-medium text-primary">{notice}</p>}
      <Button asChild className="mt-7 h-11"><Link to="/"><ArrowLeft /> Back to Point of Sale</Link></Button>
    </div>
  </main>;
}
