import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, Lock, Menu, X, PackageSearch, Pizza, Star, MapPin } from "lucide-react";
import badge from "@/assets/mimis-primary-logo.png.asset.json";
import { CALL_NUMBER } from "@/data/publicSite";

const links = [
  { href: "/#track", label: "Track Order", icon: PackageSearch },
  { href: "/#menu", label: "Menu", icon: Pizza },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/#contact", label: "Contact", icon: MapPin },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="bg-foreground px-3 py-1 text-center text-[11px] font-medium text-background">
        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-whatsapp align-middle" />Connected with our POS · track your order live
      </div>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        <Link to="/" aria-label="Mimi’s Pizza home" className="flex min-w-0 items-center gap-2">
          <img src={badge.url} alt="" className="size-10 shrink-0 object-contain sm:size-11" />
          <span className="truncate font-display text-lg font-bold">Mimi’s Pizza</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 rounded-full border border-border bg-background p-1 text-sm font-semibold md:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="rounded-full px-4 py-2 transition-colors hover:bg-primary hover:text-primary-foreground">{l.label}</a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link to="/pos" preload="intent" className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold hover:bg-accent sm:inline-flex"><Lock className="size-3.5" />Staff Access</Link>
          <a href={`tel:${CALL_NUMBER}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-bold text-primary-foreground"><Phone className="size-3.5" />Call</a>
          <button onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="inline-flex size-9 items-center justify-center rounded-full border border-border md:hidden">{open ? <X className="size-4" /> : <Menu className="size-4" />}</button>
        </div>
      </div>
      {open && (
        <nav aria-label="Main mobile" className="border-t border-border bg-card px-3 pb-3 pt-2 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="flex h-12 items-center gap-2 rounded-xl bg-accent px-3 text-sm font-semibold"><Icon className="size-4 text-primary" />{label}</a>
            ))}
          </div>
          <Link to="/pos" preload="intent" className="mt-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-bold text-muted-foreground"><Lock className="size-3.5" />Staff Access</Link>
        </nav>
      )}
    </header>
  );
}
