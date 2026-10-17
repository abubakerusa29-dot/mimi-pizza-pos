import { supabase } from "@/integrations/supabase/client";
import type { Invoice } from "@/components/pos/OrderContext";
import type { MenuOverrides } from "@/lib/menuOverrides";
import type { restaurantInfo } from "@/data/menuData";
import { normalizeInvoiceSettings, type InvoiceSettings } from "@/lib/invoiceTemplates";
import { normalizeBackOffice, type BackOffice } from "@/lib/backOffice";
import { defaultTables, normalizeTables, type DiningTable } from "@/lib/tables";

export interface PersistedSettings {
  restaurant: typeof restaurantInfo;
  riders: string[];
  areas: string[];
  menuOverrides: MenuOverrides;
  invoice: InvoiceSettings;
  tables: DiningTable[];
  backOffice: BackOffice;
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
    dispatchedAt: r.dispatched_at ? new Date(r.dispatched_at) : undefined,
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

/** Assigns one rider to many invoices at once and marks them on the way. */
export async function persistRiderAssignment(orderNos: number[], rider: string) {
  if (!orderNos.length) return;
  const { error } = await supabase.from("pos_invoices").update({ rider, status: "On the way", dispatched_at: new Date().toISOString() }).in("order_no", orderNos);
  if (error) logErr("rider assignment", error);
}

/** Loads restaurant profile, riders, areas and menu overrides; null when never saved. */
export async function loadSettings(): Promise<PersistedSettings | null> {
  const { data, error } = await supabase.from("pos_settings").select("*").eq("id", 1).maybeSingle();
  if (error) { logErr("settings", error); return null; }
  if (!data) return null;
  // Invoice look and dining tables are stored alongside the restaurant profile.
  const { invoice, tables, backOffice, ...restaurant } = (data.restaurant ?? {}) as PersistedSettings["restaurant"] & { invoice?: unknown; tables?: unknown; backOffice?: unknown };
  return {
    restaurant: restaurant as PersistedSettings["restaurant"],
    riders: data.riders as string[],
    areas: data.areas as string[],
    menuOverrides: data.menu_overrides as unknown as MenuOverrides,
    invoice: normalizeInvoiceSettings(invoice),
    tables: normalizeTables(tables) ?? defaultTables,
    backOffice: normalizeBackOffice(backOffice),
  };
}

export async function persistSettings(s: PersistedSettings) {
  const { error } = await supabase.from("pos_settings").upsert({
    id: 1,
    restaurant: JSON.parse(JSON.stringify({ ...s.restaurant, invoice: s.invoice, tables: s.tables, backOffice: s.backOffice })),
    riders: s.riders,
    areas: s.areas,
    menu_overrides: JSON.parse(JSON.stringify(s.menuOverrides)),
    updated_at: new Date().toISOString(),
  });
  if (error) logErr("settings", error);
}
