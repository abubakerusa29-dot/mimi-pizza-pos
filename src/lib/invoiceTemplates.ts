/** Customer invoice look, chosen by the owner. The software credit is NOT part of this — it always prints. */
export type TemplateId = "classic" | "compact" | "boxed" | "bold" | "minimal";
export type PaperWidth = "80" | "58";
export type LogoMode = "badge" | "wordmark" | "both" | "none";

export interface InvoiceSettings {
  template: TemplateId;
  paper: PaperWidth;
  logo: LogoMode;
  /** Optional uploaded logo (data URL); replaces the Mimi's badge when set. */
  customLogo: string;
  footer: string;
  showBarcode: boolean;
}

export const templates: { id: TemplateId; name: string; note: string }[] = [
  { id: "classic", name: "Classic", note: "Large logo, clean dashed lines, barcode" },
  { id: "compact", name: "Paper Saver", note: "Tight layout that saves paper" },
  { id: "boxed", name: "Boxed", note: "Bordered boxes with a table style total" },
  { id: "bold", name: "Bold Brand", note: "Big total with black heading bars" },
  { id: "minimal", name: "Minimal", note: "Only the essentials, simple" },
];

export const defaultInvoiceSettings: InvoiceSettings = {
  template: "classic",
  paper: "80",
  logo: "both",
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
    paper: s.paper === "58" ? "58" : "80",
    logo: (["badge", "wordmark", "both", "none"] as const).includes(s.logo as LogoMode) ? (s.logo as LogoMode) : d.logo,
    customLogo: typeof s.customLogo === "string" ? s.customLogo : "",
    footer: typeof s.footer === "string" ? s.footer.slice(0, 160) : d.footer,
    showBarcode: typeof s.showBarcode === "boolean" ? s.showBarcode : true,
  };
}
