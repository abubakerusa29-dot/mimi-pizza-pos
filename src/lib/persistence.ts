import { supabase } from "@/integrations/supabase/client";
import type { Invoice } from "@/components/pos/OrderContext";
import type { MenuOverrides } from "@/lib/menuOverrides";
import type { restaurantInfo } from "@/data/menuData";

export interface PersistedSettings {
  restaurant: typeof restaurantInfo;
  riders: string[];
  areas: string[];
  menuOverrides: MenuOverrides;
}

const logErr = (what: string, error: unknown) => console.error(`[pos] ${what} save/load failed`, error);

/** Loads saved invoices (newest first) from the database. */
export async function loadInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase.from("pos_invoices").select("*").order("order_no", { ascending: false });
  if (error) { logErr("invoices", error); return []; }
  return data.map((r) => ({
    orderNo: r.order_no,
    date: new Date(r.created_at),
    lines: r.lines as unknown as Invoice["lines"],
    orderType: r.order_type as Invoice["orderType"],
    table: r.table_no,
    phone: r.phone,
    address: r.address,
    rider: r.rider ?? undefined,
    area: r.area ?? undefined,
    status: (r.status ?? undefined) as Invoice["status"],
  }));
}

/** Saves (or updates) one invoice permanently. */
export async function persistInvoice(inv: Invoice) {
  const row = {
    order_no: inv.orderNo,
    created_at: inv.date instanceof Date ? inv.date.toISOString() : new Date(inv.date).toISOString(),
    lines: JSON.parse(JSON.stringify(inv.lines)),
    order_type: inv.orderType,
    table_no: inv.table,
    phone: inv.phone,
    address: inv.address,
    rider: inv.rider ?? null,
    area: inv.area ?? null,
    status: inv.status ?? null,
  };
  const { error } = await supabase.from("pos_invoices").upsert(row, { onConflict: "order_no" });
  if (error) logErr("invoice", error);
}

export async function persistInvoiceStatus(orderNo: number, status: string) {
  const { error } = await supabase.from("pos_invoices").update({ status }).eq("order_no", orderNo);
  if (error) logErr("invoice status", error);
}

/** Loads restaurant profile, riders, areas and menu overrides; null when never saved. */
export async function loadSettings(): Promise<PersistedSettings | null> {
  const { data, error } = await supabase.from("pos_settings").select("*").eq("id", 1).maybeSingle();
  if (error) { logErr("settings", error); return null; }
  if (!data) return null;
  return {
    restaurant: data.restaurant as PersistedSettings["restaurant"],
    riders: data.riders as string[],
    areas: data.areas as string[],
    menuOverrides: data.menu_overrides as unknown as MenuOverrides,
  };
}

export async function persistSettings(s: PersistedSettings) {
  const { error } = await supabase.from("pos_settings").upsert({
    id: 1,
    restaurant: s.restaurant,
    riders: s.riders,
    areas: s.areas,
    menu_overrides: JSON.parse(JSON.stringify(s.menuOverrides)),
    updated_at: new Date().toISOString(),
  });
  if (error) logErr("settings", error);
}
