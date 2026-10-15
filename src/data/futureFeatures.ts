import { Users, ChefHat, Contact, Bike, Boxes, Wallet, BadgePercent, Armchair, FileBarChart, type LucideIcon } from "lucide-react";

export type FutureFeature = { slug: string; label: string; icon: LucideIcon; summary: string; actions: string[] };

/** Upcoming modules shown in the sidebar. */
export const futureFeatures: FutureFeature[] = [
  { slug: "team", label: "Team Members", icon: Users, summary: "Add cashiers, managers and riders with their own access.", actions: ["Add team member", "Roles & permissions", "Shift timings", "PIN login"] },
  { slug: "kitchen", label: "Kitchen Display", icon: ChefHat, summary: "Send orders straight to the kitchen screen.", actions: ["Live order queue", "Mark as ready", "Kitchen slip print"] },
  { slug: "customers", label: "Customers", icon: Contact, summary: "Save regular customers and their addresses.", actions: ["Add customer", "Order history", "Loyalty points"] },
  { slug: "inventory", label: "Inventory", icon: Boxes, summary: "Track cheese, dough, buns and drinks stock.", actions: ["Add stock", "Low stock alerts", "Supplier list"] },
  { slug: "expenses", label: "Expenses", icon: Wallet, summary: "Record daily expenses and see real profit.", actions: ["Add expense", "Expense categories", "Daily cash closing"] },
  { slug: "discounts", label: "Discounts & Promos", icon: BadgePercent, summary: "Run offers, coupons and happy hours.", actions: ["Create discount", "Coupon codes", "Happy hour pricing"] },
  { slug: "tables", label: "Table Management", icon: Armchair, summary: "See which tables are free or occupied.", actions: ["Floor layout", "Merge tables", "Table status"] },
  { slug: "reports", label: "Reports", icon: FileBarChart, summary: "Daily, weekly and monthly reports for download.", actions: ["Item-wise sales", "Cashier report", "Export to Excel/PDF"] },
];
