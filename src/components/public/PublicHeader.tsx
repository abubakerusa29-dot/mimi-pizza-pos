import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle } from "lucide-react";
import wordmark from "@/assets/mimis-wordmark.png.asset.json";
import { CALL_NUMBER, whatsappLink } from "@/data/publicSite";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/menu" aria-label="Mimi’s Pizza home"><img src={wordmark.url} alt="Mimi’s Pizza" className="h-9 w-auto" /></Link>
        <nav className="ml-auto hidden items-center gap-5 text-sm font-semibold sm:flex">
          <Link to="/track" className="hover:text-primary">Track Order</Link>
          <a href="/menu#menu" className="hover:text-primary">Menu</a>
          <a href="/menu#contact" className="hover:text-primary">Contact</a>
        </nav>
        <div className="ml-auto flex gap-2 sm:ml-4">
          <a href={`tel:${CALL_NUMBER}`} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-semibold"><Phone className="size-4" /><span className="hidden md:inline">Call</span></a>
          <a href={whatsappLink("Assalam-o-alaikum Mimi’s Pizza, I want to place an order.")} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground"><MessageCircle className="size-4" /><span className="hidden md:inline">WhatsApp</span></a>
        </div>
      </div>
    </header>
  );
}
