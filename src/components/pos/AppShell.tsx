import { isPublicPath } from "@/data/publicSite";
import { OwnerLoginGate } from "@/components/pos/OwnerLogin";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import { StaffSessionProvider, useStaff, PinScreen } from "@/components/pos/StaffSession";
import { canOpen } from "@/lib/staffAccess";
import { Bike, PanelLeftClose, PanelLeftOpen, UtensilsCrossed, History, ChartNoAxesCombined, BookOpen, ArrowUpRight, Settings, ReceiptText, Printer, Armchair, Contact, Boxes, Wallet, FileBarChart, Users, Star } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Button } from "@/components/ui/button";
import { futureFeatures } from "@/data/futureFeatures";
import { softwareCredit } from "@/data/softwareCredit";
import badge from "@/assets/mimis-primary-logo.png.asset.json";

const navigation = [
  { to: "/pos", label: "Point of Sale", icon: UtensilsCrossed },
  { to: "/invoices", label: "Previous Invoices", icon: History },
  { to: "/riders", label: "Riders & Cash", icon: Bike },
  { to: "/sales", label: "Overall Sales", icon: ChartNoAxesCombined },
  { to: "/menu-growth", label: "Menu Management", icon: BookOpen },
  { to: "/tables", label: "Table Management", icon: Armchair },
  { to: "/customers", label: "Customers", icon: Contact },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/customer-reviews", label: "Customer Reviews", icon: Star },
  { to: "/team", label: "Team Members", icon: Users },
  { to: "/invoice-templates", label: "Invoice Templates", icon: ReceiptText },
  { to: "/printers", label: "Printer Setup", icon: Printer },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useLocation({ select: (l) => l.pathname });
  if (isPublicPath(path)) return <>{children}</>;
  return <OwnerLoginGate><StaffSessionProvider><Shell>{children}</Shell></StaffSessionProvider></OwnerLoginGate>;
}

function Shell({ children }: { children: ReactNode }) {
  const { user, locked, signOut, ownerPinSet } = useStaff();
  const path = useLocation({ select: (l) => l.pathname });
  const allowed = canOpen(user, path);
  const [expanded, setExpanded] = useState(false);
  const { restaurant } = useOrder();
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Collapse navigation" : "Expand navigation"} title={expanded ? "Collapse navigation" : "Expand navigation"}>
            {expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
          <img src={badge.url} alt="Mimi’s Pizza logo" className="h-[52px] w-[52px] shrink-0 object-contain" />
           <div className="min-w-0"><h1 className="truncate text-base font-bold leading-tight sm:text-lg">Mimi’s Pizza</h1><p className="mt-0.5 hidden sm:flex items-center gap-1 text-xs text-muted-foreground"><Bike className="h-3.5 w-3.5 shrink-0 text-primary" /> Take away & free home delivery</p></div>
        </div>
        <div className="flex items-center gap-2"><span className="hidden text-xs font-medium text-muted-foreground lg:block">{restaurant.phone}</span>{ownerPinSet && user && <><span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium"><ShieldCheck className="size-3.5 text-primary" />{user.name}</span><Button variant="ghost" size="icon" onClick={signOut} aria-label="Lock and switch user" title="Lock and switch user"><LogOut /></Button></>}</div>
      </header>
      <div className="relative flex min-h-0 flex-1">
        {expanded && <div className="absolute inset-0 z-30 bg-foreground/30 xl:hidden" onClick={() => setExpanded(false)} />}
        <aside className={`absolute inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] xl:relative ${expanded ? "w-56" : "hidden w-[72px] xl:flex"}`}>
          <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.filter(({ to }) => canOpen(user, to)).map(({ to, label, icon: Icon }, index) => (
              <Button key={to} asChild variant="ghost" className={`h-12 w-full rounded-lg ${expanded ? "justify-start px-3" : "px-0"}`}>
                  <Link to={to} activeOptions={{ exact: true }} activeProps={{ className: "bg-sidebar-accent text-primary hover:bg-sidebar-accent" }} inactiveProps={{ className: "text-muted-foreground" }} onClick={() => { if (window.innerWidth < 1280) setExpanded(false); }} title={label} aria-label={label}>
                  <Icon className="!h-5 !w-5" />{expanded && <span className="text-[13px]">{label}</span>}{expanded && index > 0 && <ArrowUpRight className="ml-auto !h-3 !w-3" />}
                </Link>
              </Button>
            ))}
            {futureFeatures.length > 0 && <p className={`px-3 pb-1 pt-4 text-[10px] font-semibold uppercase text-muted-foreground ${expanded ? "" : "sr-only"}`}>Coming soon</p>}
            {futureFeatures.map(({ slug, label, icon: Icon }) => (
              <Button key={slug} asChild variant="ghost" className={`h-10 w-full rounded-lg ${expanded ? "justify-start px-3" : "px-0"}`}>
                <Link to="/features/$slug" params={{ slug }} activeProps={{ className: "bg-sidebar-accent text-primary hover:bg-sidebar-accent" }} inactiveProps={{ className: "text-muted-foreground" }} onClick={() => { if (window.innerWidth < 1280) setExpanded(false); }} title={label} aria-label={label}>
                  <Icon className="!h-[18px] !w-[18px]" />{expanded && <span className="text-[13px]">{label}</span>}
                </Link>
              </Button>
            ))}
          </nav>
          {expanded && <div className="shrink-0 border-t border-border p-5"><p className="text-xs font-semibold">Mimi’s Pizza</p><p className="mt-1 text-xs text-muted-foreground">Counter workspace</p></div>}
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{locked ? <PinScreen /> : allowed ? children : <PinScreen title="Owner access needed" />}</div>
      </div>
      <footer className="hidden shrink-0 border-t border-border bg-card px-4 py-1 text-center text-[11px] text-muted-foreground md:block">
        This software made by{" "}
        <a href={softwareCredit.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{softwareCredit.name}</a>
        {" · "}{softwareCredit.phone}
      </footer>
    </div>
  );
}