import { lineTotal } from "@/lib/cart";
import type { CartLine } from "@/lib/cart";

export interface Customer { phone: string; name: string; address: string; notes: string; area?: string }
export interface StockItem { id: string; name: string; unit: string; qty: number; lowAt: number }
export interface Expense { id: string; date: string; type: string; reason: string; amount: number }
export interface TeamMember { id: string; name: string; role: string; phone: string; shift: string; active: boolean }

export interface BackOffice { customers: Customer[]; stock: StockItem[]; expenses: Expense[]; team: TeamMember[] }

export const expenseTypes = ["Ingredients", "Packing material", "Salaries", "Rent", "Electricity & gas", "Fuel", "Repairs", "Other"];
export const teamRoles = ["Owner", "Manager", "Cashier", "Chef", "Kitchen helper", "Rider", "Waiter"];

export const emptyBackOffice: BackOffice = {
  customers: [],
  stock: [
    { id: "box-s", name: "Small pizza box", unit: "pcs", qty: 0, lowAt: 50 },
    { id: "box-l", name: "Large pizza box", unit: "pcs", qty: 0, lowAt: 50 },
    { id: "bag", name: "Carry bags", unit: "pcs", qty: 0, lowAt: 100 },
    { id: "wrap", name: "Burger wrappers", unit: "pcs", qty: 0, lowAt: 100 },
  ],
  expenses: [],
  team: [],
};

const arr = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);
export function normalizeBackOffice(v: unknown): BackOffice {
  const o = (v ?? {}) as Partial<BackOffice>;
  return { customers: arr(o.customers, []), stock: arr(o.stock, emptyBackOffice.stock), expenses: arr(o.expenses, []), team: arr(o.team, []) };
}

export const newId = () => Math.random().toString(36).slice(2, 10);
export const cleanPhone = (p: string) => p.replace(/\D/g, "");
export const findCustomer = (list: Customer[], phone: string) => {
  const p = cleanPhone(phone);
  return p.length >= 3 ? list.find((c) => cleanPhone(c.phone) === p) : undefined;
};
export const isLowStock = (s: StockItem) => s.qty <= s.lowAt;

/** Adds or updates a customer keyed by phone number. */
export function upsertCustomer(list: Customer[], c: Customer): Customer[] {
  const p = cleanPhone(c.phone);
  return [c, ...list.filter((x) => cleanPhone(x.phone) !== p)];
}

const sum = (lines: CartLine[]) => lines.reduce((s, l) => s + lineTotal(l), 0);
export interface ReportRow { date: Date; lines: CartLine[] }
/** Profit summary for a period: sales minus expenses. Dates are YYYY-MM-DD strings (inclusive). */
export function profitReport(invoices: ReportRow[], expenses: Expense[], from: string, to: string) {
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const inRange = (k: string) => (!from || k >= from) && (!to || k <= to);
  const sales = invoices.filter((i) => inRange(key(new Date(i.date)))).reduce((s, i) => s + sum(i.lines), 0);
  const exp = expenses.filter((e) => inRange(e.date));
  const spent = exp.reduce((s, e) => s + e.amount, 0);
  const byType: Record<string, number> = {};
  exp.forEach((e) => { byType[e.type] = (byType[e.type] ?? 0) + e.amount; });
  return { sales, spent, profit: sales - spent, byType };
}

export const customerHistory = (invoices: { phone: string; lines: CartLine[] }[], phone: string) => {
  const p = cleanPhone(phone);
  const mine = invoices.filter((i) => cleanPhone(i.phone) === p);
  return { orders: mine.length, spent: mine.reduce((s, i) => s + sum(i.lines), 0) };
};

/** Search saved customers by name, phone, address or area. */
export function searchCustomers(list: Customer[], q: string): Customer[] {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  const digits = cleanPhone(t);
  return list.filter((c) => `${c.name} ${c.address} ${c.area ?? ""}`.toLowerCase().includes(t) || (digits.length > 0 && cleanPhone(c.phone).includes(digits))).slice(0, 8);
}
