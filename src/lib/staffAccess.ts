// Staff access rules. Pure functions so they can be tested.
export const accessAreas = [
  { key: "pos", label: "Take orders (POS)", group: "counter", paths: ["/"] },
  { key: "invoices", label: "Previous invoices and reprint", group: "counter", paths: ["/invoices"] },
  { key: "riders", label: "Assign riders and collect cash", group: "counter", paths: ["/riders"] },
  { key: "tables", label: "Tables (dine-in)", group: "counter", paths: ["/tables"] },
  { key: "customers", label: "Customers phonebook", group: "counter", paths: ["/customers"] },
  { key: "inventory", label: "Packing stock", group: "counter", paths: ["/inventory"] },
  { key: "sales", label: "Overall sales", group: "owner", paths: ["/sales"] },
  { key: "expenses", label: "Expenses", group: "owner", paths: ["/expenses"] },
  { key: "reports", label: "Reports (profit)", group: "owner", paths: ["/reports"] },
  { key: "menu", label: "Menu and prices", group: "owner", paths: ["/menu-growth"] },
  { key: "setup", label: "Invoice templates and printer", group: "owner", paths: ["/invoice-templates", "/printers"] },
] as const;
export type AccessKey = (typeof accessAreas)[number]["key"];

/** Pages only the owner can open, whatever the staff permissions. */
export const ownerOnlyPaths = ["/team", "/settings"];

export const rolePresets: Record<string, AccessKey[]> = {
  Manager: ["pos", "invoices", "riders", "tables", "customers", "inventory", "menu", "setup"],
  Cashier: ["pos", "invoices", "riders", "tables", "customers"],
  "Order taker": ["pos", "tables"],
  Waiter: ["pos", "tables"],
  Rider: ["riders"],
  Chef: ["invoices"],
  "Kitchen helper": ["invoices"],
};
export const staffRoles = Object.keys(rolePresets);

export interface ActiveUser { id: string; name: string; isOwner: boolean; permissions: AccessKey[] }

export function canOpen(user: ActiveUser | null, path: string): boolean {
  if (!user) return false;
  if (user.isOwner) return true;
  if (path.startsWith("/features/")) return true;
  if (ownerOnlyPaths.some((p) => path === p)) return false;
  const area = accessAreas.find((a) => (a.paths as readonly string[]).includes(path));
  return area ? user.permissions.includes(area.key) : false;
}

export const isValidPin = (pin: string) => /^\d{4,6}$/.test(pin);
