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
  { id: "classic", name: "Classic", note: "Bara logo, saaf dashed lines, barcode" },
  { id: "compact", name: "Paper Saver", note: "Kam jagah, kam paper kharch" },
  { id: "boxed", name: "Boxed", note: "Double borders, table jaisa total" },
  { id: "bold", name: "Bold Brand", note: "Bara TOTAL, ulta (black) heading" },
  { id: "minimal", name: "Minimal", note: "Sirf zaroori cheezein, simple" },
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
