export interface DiningTable { name: string; section: string; seats: number }

export const defaultTables: DiningTable[] = [
  { name: "Table 1", section: "Indoor", seats: 4 },
  { name: "Table 2", section: "Indoor", seats: 4 },
  { name: "Table 3", section: "Family Hall", seats: 6 },
  { name: "Table 4", section: "Outdoor", seats: 2 },
];

/** Label printed on slips, e.g. "Table 3 (Family Hall)". */
export const tableLabel = (t: DiningTable) => (t.section ? `${t.name} (${t.section})` : t.name);

/** Cleans saved table data; returns null when nothing valid was saved. */
export function normalizeTables(raw: unknown): DiningTable[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter((t): t is DiningTable => !!t && typeof (t as DiningTable).name === "string" && (t as DiningTable).name.trim() !== "")
    .map((t) => ({ name: t.name.trim(), section: String(t.section ?? "").trim(), seats: Math.max(1, Math.round(Number(t.seats) || 1)) }));
}

/** A table is occupied while a dine-in order for it from today has not been closed. */
export function occupiedTables(invoices: { orderType: string; table: string; date: Date; status?: string | undefined }[], now = new Date()): Set<string> {
  const day = now.toDateString();
  return new Set(invoices.filter((i) => i.orderType === "Dine-in" && i.table && !i.status && new Date(i.date).toDateString() === day).map((i) => i.table));
}
