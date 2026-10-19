/** Slip looks chosen by the owner. The software credit is NOT part of this; it always prints. */
export type TemplateId = "classic" | "compact" | "boxed" | "bold" | "minimal" | "premium" | "retail";
export type KitchenTemplateId = "standard" | "checklist" | "large";
export type RiderTemplateId = "standard" | "cash" | "compact";
export type PaperWidth = "80" | "58";
export type LogoMode = "badge" | "wordmark" | "both" | "none";

export interface InvoiceSettings {
  template: TemplateId;
  kitchenTemplate: KitchenTemplateId;
  riderTemplate: RiderTemplateId;
  paper: PaperWidth;
  logo: LogoMode;
  /** Optional uploaded logo (data URL); replaces the Mimi's badge when set. */
  customLogo: string;
  footer: string;
  showBarcode: boolean;
}

export const templates: { id: TemplateId; name: string; note: string }[] = [
  { id: "classic", name: "Classic", note: "Large logo, clean dashed lines, barcode" },
  { id: "premium", name: "Premium Bistro", note: "Boxed item table with a bold grand total" },
  { id: "retail", name: "Retail Grid", note: "Full table with Sr #, Qty, Rate and Amount" },
  { id: "compact", name: "Paper Saver", note: "Tight layout that saves paper" },
  { id: "boxed", name: "Boxed", note: "Bordered boxes with a table style total" },
  { id: "bold", name: "Bold Brand", note: "Big total with black heading bars" },
  { id: "minimal", name: "Minimal", note: "Only the essentials, simple" },
];

export const kitchenTemplates: { id: KitchenTemplateId; name: string; note: string }[] = [
  { id: "standard", name: "Standard", note: "Items with deal contents and flavours" },
  { id: "checklist", name: "Chef Checklist", note: "Tick box next to every item" },
  { id: "large", name: "Large Print", note: "Big text, easy to read from far" },
];

export const riderTemplates: { id: RiderTemplateId; name: string; note: string }[] = [
  { id: "standard", name: "Standard", note: "Items, address, rider and signature" },
  { id: "cash", name: "Cash Focus", note: "Big address and cash to collect box" },
  { id: "compact", name: "Compact", note: "Short slip, only the delivery details" },
];

export const defaultInvoiceSettings: InvoiceSettings = {
  template: "premium",
  kitchenTemplate: "standard",
  riderTemplate: "cash",
  paper: "80",
  logo: "badge",
  customLogo: "",
  footer: "Thank you for your order! Please visit again",
  showBarcode: true,
};

/** Fills missing/invalid saved values with defaults. */
export function normalizeInvoiceSettings(v: unknown): InvoiceSettings {
  const s = (v && typeof v === "object" ? v : {}) as Partial<InvoiceSettings>;
  const d = defaultInvoiceSettings;
  return {
    template: templates.some((t) => t.id === s.template) ? s.template! : d.template,
    kitchenTemplate: kitchenTemplates.some((t) => t.id === s.kitchenTemplate) ? s.kitchenTemplate! : d.kitchenTemplate,
    riderTemplate: riderTemplates.some((t) => t.id === s.riderTemplate) ? s.riderTemplate! : d.riderTemplate,
    paper: s.paper === "58" ? "58" : "80",
    logo: (["badge", "wordmark", "both", "none"] as const).includes(s.logo as LogoMode) ? (s.logo as LogoMode) : d.logo,
    customLogo: typeof s.customLogo === "string" ? s.customLogo : "",
    footer: typeof s.footer === "string" ? s.footer.slice(0, 160) : d.footer,
    showBarcode: typeof s.showBarcode === "boolean" ? s.showBarcode : true,
  };
}
