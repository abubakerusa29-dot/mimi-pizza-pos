import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, Bluetooth, Wifi, Usb, AlertTriangle } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { PaperPrintStyle, SampleCustomerSlip } from "@/components/pos/ReceiptPreview";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/printers")({
  head: () => ({ meta: [{ title: "Printer Setup — Mimi’s Pizza POS" }, { name: "description", content: "Connect a thermal printer to the Android tablet and run a test print." }, { property: "og:title", content: "Printer Setup — Mimi’s Pizza POS" }, { property: "og:description", content: "Android thermal printer guide, paper sizes and test print." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PrinterSetup,
});

const guides = [
  { icon: Bluetooth, title: "Bluetooth printer", steps: ["Tablet Settings → Bluetooth mein printer pair karein (PIN aam tor par 0000 ya 1234).", "Play Store se “RawBT” app install karein aur usmein printer select karein.", "RawBT settings mein paper width 80mm / 58mm rakhein.", "Print dabane par Chrome mein printer list se “RawBT” chunein."] },
  { icon: Wifi, title: "Wi-Fi / LAN printer", steps: ["Printer aur tablet ek hi Wi-Fi par hon.", "Settings → Connected devices → Printing mein “Default Print Service” ya printer brand ka plugin on karein.", "Print dialog mein printer khud nazar aa jayega."] },
  { icon: Usb, title: "USB (OTG cable)", steps: ["USB-C OTG adapter se printer tablet se lagayein.", "RawBT app USB permission maangegi — Allow karein.", "Print dialog mein “RawBT” chunein."] },
];

const problems = [
  ["Kagaz par kuch print nahi hota / khali nikalta hai", "Thermal roll ulta laga hai. Naakhun se ragar kar dekhein — jo taraf kaali ho woh bahar ki taraf honi chahiye."],
  ["Print bohat chhota ya kata hua hai", "Print dialog mein Paper size = 80mm (ya 58mm) aur Margins = None rakhein. Yahan template mein bhi wahi size chunein."],
  ["Upar URL aur date print ho rahi hai", "Print dialog → More settings → “Headers and footers” band karein."],
  ["Printer list mein nahi aata", "Bluetooth dobara pair karein, RawBT khol kar “Test” dabayein, tablet restart karein."],
  ["Har slip alag nahi katti", "Print All har slip alag job bhejta hai; printer ki auto-cut setting on karein."],
];

function PrinterSetup() {
  const { invoiceSettings, restaurant } = useOrder();
  const [paper, setPaper] = useState<"80" | "58" | null>(null);
  useEffect(() => {
    if (!paper) return;
    const id = requestAnimationFrame(() => { window.print(); setTimeout(() => setPaper(null), 300); });
    return () => cancelAnimationFrame(id);
  }, [paper]);

  return (
    <div className="min-h-0 w-full flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div><h2 className="font-display text-xl font-semibold">Printer Setup</h2><p className="text-xs text-muted-foreground">Android tablet ke Chrome browser se thermal printer chalane ka tareeqa aur test print.</p></div>

        <section className="rounded-xl border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Printer className="size-4 text-primary" /> Test print</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">Ek namoona customer receipt print hoga. Jo size sahi aaye, wahi <Link to="/invoice-templates" className="font-semibold text-primary underline">Invoice Templates</Link> mein chunein. Abhi chuna hua: {invoiceSettings.paper}mm.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => setPaper("80")}><Printer /> Test Print 80mm</Button>
            <Button variant="outline" onClick={() => setPaper("58")}><Printer /> Test Print 58mm</Button>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold">Paper size kya hai?</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg bg-muted p-3"><p className="font-semibold">80mm — Standard (recommended)</p><p className="mt-1 text-muted-foreground">Roll ki chaurai ~8cm. Ek line mein ~48 harf. Restaurant counter printers mein yahi hota hai. Logo, items aur total khul kar aate hain.</p></div>
            <div className="rounded-lg bg-muted p-3"><p className="font-semibold">58mm — Chhota</p><p className="mt-1 text-muted-foreground">Roll ki chaurai ~5.8cm. Ek line mein ~32 harf. Chhote / portable Bluetooth printers mein. Text chhota aata hai.</p></div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Pehchan: roll ko scale se naapein, ya printer ke dabbe/neeche lage sticker par “80mm” ya “58mm” likha hota hai.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {guides.map(({ icon: I, title, steps }) => (
            <section key={title} className="rounded-xl border bg-card p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><I className="size-4 text-primary" /> {title}</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </section>
          ))}
        </div>

        <section className="rounded-xl border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="size-4 text-primary" /> Masla aaye to</h3>
          <div className="mt-3 divide-y text-xs">{problems.map(([p, f]) => <div key={p} className="py-2"><p className="font-semibold">{p}</p><p className="text-muted-foreground">{f}</p></div>)}</div>
          <p className="mt-2 text-[11px] text-muted-foreground">Note: website browser ke print dialog se chhapti hai; printer ka driver/app (jaise RawBT) tablet par hona zaroori hai.</p>
        </section>
      </div>
      {paper && createPortal(
        <div id="print-root" className={paper === "58" ? "paper-58" : ""}><PaperPrintStyle paper={paper} /><div className="print-page"><SampleCustomerSlip invoice={{ ...invoiceSettings, paper }} restaurant={restaurant} /></div></div>,
        document.body,
      )}
    </div>
  );
}
