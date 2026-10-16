import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import badge from "@/assets/mimis-primary-logo.png.asset.json";

const links = [
  { href: "/#track", label: "Track Order" },
  { href: "/#menu", label: "Digital Menu" },
  { href: "/#contact", label: "Contact" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="Mimi’s Pizza home" className="flex min-w-0 items-center gap-2">
          <img src={badge.url} alt="" className="size-11 shrink-0 object-contain" />
          <span className="truncate font-display text-lg font-bold">Mimi’s Pizza</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 rounded-full border border-border bg-background p-1 text-sm font-semibold md:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="rounded-full px-4 py-2 transition-colors hover:bg-primary hover:text-primary-foreground">{l.label}</a>)}
        </nav>
        <div className="flex justify-end">
          <Link to="/pos" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"><Lock className="size-3.5" />Staff Access</Link>
        </div>
      </div>
      <nav aria-label="Main mobile" className="flex justify-center gap-1 border-t border-border px-2 py-1.5 text-xs font-semibold md:hidden">
        {links.map((l) => <a key={l.href} href={l.href} className="rounded-full px-3 py-1.5 hover:bg-accent">{l.label}</a>)}
      </nav>
    </header>
  );
}
