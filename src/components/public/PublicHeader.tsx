import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import badge from "@/assets/mimis-primary-logo.png.asset.json";
import { CALL_NUMBER } from "@/data/publicSite";

const links = [
  { href: "/#track", label: "Track Order" },
  { href: "/#menu", label: "Menu" },
  { href: "/#contact", label: "Contact" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="bg-foreground px-3 py-1 text-center text-[11px] font-medium text-background">
        <span className="mr-1.5 inline-block size-1.5 rounded-full bg-whatsapp align-middle" />Connected with our POS system · track your order live
      </div>
      <div className="mx-auto grid h-14 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 sm:h-16 sm:px-4 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="Mimi’s Pizza home" className="flex min-w-0 items-center gap-2">
          <img src={badge.url} alt="" className="size-10 shrink-0 object-contain sm:size-11" />
          <span className="truncate font-display text-lg font-bold">Mimi’s Pizza</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 rounded-full border border-border bg-background p-1 text-sm font-semibold md:flex">
          {links.map((l) => <a key={l.href} href={l.href} className="rounded-full px-4 py-2 transition-colors hover:bg-primary hover:text-primary-foreground">{l.label}</a>)}
        </nav>
        <div className="flex justify-end">
          <a href={`tel:${CALL_NUMBER}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground"><Phone className="size-3.5" />Call</a>
        </div>
      </div>
      <nav aria-label="Main mobile" className="grid grid-cols-3 border-t border-border text-center text-xs font-semibold md:hidden">
        {links.map((l) => <a key={l.href} href={l.href} className="py-2 hover:bg-accent">{l.label}</a>)}
      </nav>
    </header>
  );
}
