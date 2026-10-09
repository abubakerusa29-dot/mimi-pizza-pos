import { Settings, Users, ReceiptText, ChefHat, Contact, Bike, Boxes, Wallet, BadgePercent, Armchair, FileBarChart, Printer, type LucideIcon } from "lucide-react";

export type FutureFeature = { slug: string; label: string; icon: LucideIcon; summary: string; actions: string[] };

/** Demo-only list of features planned for the final software. */
export const futureFeatures: FutureFeature[] = [
  { slug: "settings", label: "Settings", icon: Settings, summary: "Restaurant name, address, phone, tax and receipt preferences.", actions: ["Business profile", "Tax & charges", "Receipt footer", "Language"] },
  { slug: "team", label: "Team Members", icon: Users, summary: "Add cashiers, managers and riders with their own access.", actions: ["Add team member", "Roles & permissions", "Shift timings", "PIN login"] },
  { slug: "invoice-templates", label: "Invoice Templates", icon: ReceiptText, summary: "Change the look of the printed bill.", actions: ["Choose template", "Logo & header", "Footer message", "Paper size 58/80mm"] },
  { slug: "kitchen", label: "Kitchen Display", icon: ChefHat, summary: "Send orders straight to the kitchen screen.", actions: ["Live order queue", "Mark as ready", "Kitchen slip print"] },
  { slug: "customers", label: "Customers", icon: Contact, summary: "Save regular customers and their addresses.", actions: ["Add customer", "Order history", "Loyalty points"] },
  { slug: "delivery", label: "Delivery Riders", icon: Bike, summary: "Assign delivery orders to riders and track them.", actions: ["Assign rider", "Delivery charges", "Rider cash collection"] },
  { slug: "inventory", label: "Inventory", icon: Boxes, summary: "Track cheese, dough, buns and drinks stock.", actions: ["Add stock", "Low stock alerts", "Supplier list"] },
  { slug: "expenses", label: "Expenses", icon: Wallet, summary: "Record daily expenses and see real profit.", actions: ["Add expense", "Expense categories", "Daily cash closing"] },
  { slug: "discounts", label: "Discounts & Promos", icon: BadgePercent, summary: "Run offers, coupons and happy hours.", actions: ["Create discount", "Coupon codes", "Happy hour pricing"] },
  { slug: "tables", label: "Table Management", icon: Armchair, summary: "See which tables are free or occupied.", actions: ["Floor layout", "Merge tables", "Table status"] },
  { slug: "reports", label: "Reports", icon: FileBarChart, summary: "Daily, weekly and monthly reports for download.", actions: ["Item-wise sales", "Cashier report", "Export to Excel/PDF"] },
  { slug: "printers", label: "Printer Setup", icon: Printer, summary: "Connect thermal printers over USB, Bluetooth or network.", actions: ["Add printer", "Test print", "Kitchen printer"] },
];
