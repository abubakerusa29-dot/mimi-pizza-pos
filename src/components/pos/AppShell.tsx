import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bike, PanelLeftClose, PanelLeftOpen, UtensilsCrossed, History, ChartNoAxesCombined, BookOpen, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/mimis-logo.png.asset.json";

const navigation = [
  { to: "/", label: "Point of Sale", icon: UtensilsCrossed },
  { to: "/invoices", label: "Previous Invoices", icon: History },
  { to: "/sales", label: "Overall Sales", icon: ChartNoAxesCombined },
  { to: "/menu-growth", label: "Menu Growth", icon: BookOpen },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Collapse navigation" : "Expand navigation"} title={expanded ? "Collapse navigation" : "Expand navigation"}>
            {expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
          <img src={logo.url} alt="Mimi’s Pizza logo" className="h-12 w-12 shrink-0 object-contain" />
          <div className="min-w-0"><h1 className="font-display text-lg font-semibold sm:text-xl">Mimi’s Pizza</h1><p className="flex items-center gap-1 text-xs text-muted-foreground"><Bike className="h-3.5 w-3.5 text-primary" /> Delivery available</p></div>
        </div>
        <span className="rounded-md border border-primary/20 bg-secondary px-2 py-1 text-[10px] font-bold text-primary sm:text-xs">POS DEMO</span>
      </header>
      <div className="relative flex min-h-0 flex-1">
        {expanded && <div className="absolute inset-0 z-30 bg-foreground/30 md:hidden" onClick={() => setExpanded(false)} />}
        <aside className={`absolute inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] md:relative ${expanded ? "w-56" : "hidden w-[72px] md:flex"}`}>
          <nav aria-label="Main navigation" className="space-y-2 px-3 py-5">
            {navigation.map(({ to, label, icon: Icon }, index) => (
              <Button key={to} asChild variant="ghost" className={`h-12 w-full rounded-lg ${expanded ? "justify-start px-3" : "px-0"}`}>
                <Link to={to} activeOptions={{ exact: true }} activeProps={{ className: "bg-sidebar-accent text-primary hover:bg-sidebar-accent" }} inactiveProps={{ className: "text-muted-foreground" }} onClick={() => { if (window.innerWidth < 768) setExpanded(false); }} title={label} aria-label={label}>
                  <Icon className="!h-5 !w-5" />{expanded && <span className="text-[13px]">{label}</span>}{expanded && index > 0 && <ArrowUpRight className="ml-auto !h-3 !w-3" />}
                </Link>
              </Button>
            ))}
          </nav>
          {expanded && <div className="mt-auto border-t border-border p-5"><p className="text-xs font-semibold">Mimi’s Pizza</p><p className="mt-1 text-xs text-muted-foreground">Counter workspace</p></div>}
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}