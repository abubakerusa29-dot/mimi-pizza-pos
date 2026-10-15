import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rolePresets, type AccessKey, type ActiveUser } from "@/lib/staffAccess";

const KEY = "mimi-active-user";
interface Ctx { user: ActiveUser | null; locked: boolean; signIn: (pin: string) => boolean; signOut: () => void; ownerPinSet: boolean }
const StaffCtx = createContext<Ctx | null>(null);
export const useStaff = () => {
  const c = useContext(StaffCtx);
  if (!c) throw new Error("useStaff must be inside StaffSessionProvider");
  return c;
};

export function StaffSessionProvider({ children }: { children: ReactNode }) {
  const { backOffice } = useOrder();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { setUserId(window.localStorage.getItem(KEY)); }, []);
  const ownerPinSet = !!backOffice.ownerPin;

  const user = useMemo<ActiveUser | null>(() => {
    if (!ownerPinSet || userId === "owner") return { id: "owner", name: "Owner", isOwner: true, permissions: [] };
    const m = backOffice.team.find((t) => t.id === userId && t.active && t.pin);
    if (!m) return null;
    return { id: m.id, name: m.name, isOwner: false, permissions: (m.permissions ?? rolePresets[m.role] ?? []) as AccessKey[] };
  }, [ownerPinSet, userId, backOffice.team]);

  const remember = (id: string | null) => { setUserId(id); if (id) window.localStorage.setItem(KEY, id); else window.localStorage.removeItem(KEY); };
  const signIn = (pin: string) => {
    if (backOffice.ownerPin && pin === backOffice.ownerPin) { remember("owner"); return true; }
    const m = backOffice.team.find((t) => t.active && t.pin && t.pin === pin);
    if (m) { remember(m.id); return true; }
    return false;
  };
  return <StaffCtx.Provider value={{ user, locked: !user, signIn, signOut: () => remember(null), ownerPinSet }}>{children}</StaffCtx.Provider>;
}

export function PinScreen({ title = "Enter your PIN", onDone }: { title?: string; onDone?: () => void }) {
  const { signIn } = useStaff();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => { if (signIn(pin)) { setPin(""); setErr(false); onDone?.(); } else setErr(true); };
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="w-full max-w-xs space-y-3 rounded-xl border bg-card p-6 text-center">
        <Lock className="mx-auto size-8 text-primary" />
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">Owner or staff member PIN</p>
        <Input autoFocus value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" type="password" placeholder="••••" aria-label="PIN" className="text-center text-lg tracking-widest" />
        {err && <p className="text-xs text-destructive">Wrong PIN. Try again.</p>}
        <Button type="submit" className="w-full">Unlock</Button>
      </form>
    </div>
  );
}
