import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock, RotateCcw, Upload } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { SampleCustomerSlip } from "@/components/pos/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { softwareCredit } from "@/data/softwareCredit";
import { defaultInvoiceSettings, templates, type InvoiceSettings, type LogoMode } from "@/lib/invoiceTemplates";

export const Route = createFileRoute("/invoice-templates")({
  head: () => ({ meta: [{ title: "Invoice Templates — Mimi’s Pizza POS" }, { name: "description", content: "Choose and preview the printed customer invoice design." }, { property: "og:title", content: "Invoice Templates — Mimi’s Pizza POS" }, { property: "og:description", content: "Five thermal invoice designs with logo, footer and paper size." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: InvoiceTemplates,
});

const logoModes: { id: LogoMode; label: string }[] = [
  { id: "both", label: "Logo + Wordmark" }, { id: "badge", label: "Sirf Logo" }, { id: "wordmark", label: "Sirf Wordmark" }, { id: "none", label: "Koi logo nahi" },
];

function InvoiceTemplates() {
  const { invoiceSettings: s, setInvoiceSettings, restaurant } = useOrder();
  const set = (patch: Partial<InvoiceSettings>) => setInvoiceSettings({ ...s, ...patch });
  const onLogo = (file?: File) => {
    if (!file) return;
    if (file.size > 400_000) { alert("Logo 400KB se chhota hona chahiye."); return; }
    const r = new FileReader();
    r.onload = () => set({ customLogo: String(r.result) });
    r.readAsDataURL(file);
  };
  const chip = (on: boolean) => `rounded-md border px-3 py-2 text-xs font-semibold ${on ? "border-primary bg-primary/10 text-primary" : "bg-card text-muted-foreground"}`;

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="font-display text-xl font-semibold">Invoice Templates</h2><p className="text-xs text-muted-foreground">Customer receipt ka design chunein. Har tabdeeli foran save hoti hai aur POS par print hoti hai.</p></div>
            <Button variant="outline" className="h-9 text-xs" onClick={() => setInvoiceSettings(defaultInvoiceSettings)}><RotateCcw /> Reset</Button>
          </div>

          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">1. Template</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((t) => (
                <button key={t.id} onClick={() => set({ template: t.id })} className={`flex items-start gap-2 rounded-lg border p-3 text-left ${s.template === t.id ? "border-primary bg-primary/10" : "bg-background"}`}>
                  <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${s.template === t.id ? "border-primary bg-primary text-primary-foreground" : ""}`}>{s.template === t.id && <Check className="size-3" />}</span>
                  <span><span className="block text-sm font-semibold">{t.name}</span><span className="text-[11px] text-muted-foreground">{t.note}</span></span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">2. Paper size</h3>
            <div className="mt-3 flex gap-2">
              <button className={chip(s.paper === "80")} onClick={() => set({ paper: "80" })}>80mm (Standard)</button>
              <button className={chip(s.paper === "58")} onClick={() => set({ paper: "58" })}>58mm (Chhota)</button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Apne printer ke roll ki chaurai naap lein: ~8cm = 80mm, ~5.8cm = 58mm. Restaurant counter printers aam tor par 80mm hote hain.</p>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">3. Logo</h3>
            <div className="mt-3 flex flex-wrap gap-2">{logoModes.map((m) => <button key={m.id} className={chip(s.logo === m.id)} onClick={() => set({ logo: m.id })}>{m.label}</button>)}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-xs font-semibold"><Upload className="size-4" /> Naya logo upload<input type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} /></label>
              {s.customLogo && <Button variant="ghost" size="sm" className="text-xs" onClick={() => set({ customLogo: "" })}>Asal logo wapas</Button>}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Behtar print ke liye logo black &amp; white aur white background par ho.</p>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">4. Footer message</h3>
            <Textarea value={s.footer} maxLength={160} onChange={(e) => set({ footer: e.target.value })} className="mt-3 text-sm" rows={2} aria-label="Footer message" />
            <label className="mt-3 flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={s.showBarcode} onChange={(e) => set({ showBarcode: e.target.checked })} /> Barcode print karein</label>
            <div className="mt-3 flex items-start gap-2 rounded-md bg-muted p-3 text-[11px] text-muted-foreground">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              <span>Har slip ke neeche “Software by {softwareCredit.name}” hamesha print hoga. Isay hataya nahi ja sakta.</span>
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-0 lg:self-start">
          <p className="mb-3 text-center text-xs font-semibold text-muted-foreground">Live preview · {s.paper}mm</p>
          <div className={`flex justify-center rounded-xl bg-muted p-6 ${s.paper === "58" ? "paper-58" : ""}`}>
            <SampleCustomerSlip invoice={s} restaurant={restaurant} />
          </div>
        </div>
      </div>
    </div>
  );
}
