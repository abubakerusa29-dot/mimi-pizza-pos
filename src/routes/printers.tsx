import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, Bluetooth, Wifi, Usb, AlertTriangle } from "lucide-react";
import { useOrder } from "@/components/pos/OrderContext";
import { PaperPrintStyle, SampleCustomerSlip } from "@/components/pos/ReceiptPreview";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/printers")({
  head: () => ({ meta: [{ title: "Printer Setup — Mimi’s Pizza POS" }, { name: "description", content: "Connect a thermal printer to the Android tablet and run a test print." }, { property: "og:title", content: "Printer Setup — Mimi’s Pizza POS" }, { property: "og:description", content: "Android thermal printer guide, paper sizes and test print." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PrinterSetup,
});

const guides = [
  { icon: Bluetooth, title: "Bluetooth printer", steps: ["Open tablet Settings, then Bluetooth, and pair the printer (PIN is usually 0000 or 1234).", "Install the “RawBT” app from Play Store and select your printer in it.", "In RawBT settings, set paper width to 80mm or 58mm.", "When you press Print, choose “RawBT” from the Chrome printer list."] },
  { icon: Wifi, title: "Wi-Fi / LAN printer", steps: ["Connect the printer and tablet to the same Wi-Fi.", "In Settings, open Connected devices, then Printing, and turn on “Default Print Service” or your printer brand plugin.", "The printer will then show in the print dialog."] },
  { icon: Usb, title: "USB (OTG cable)", steps: ["Connect the printer to the tablet with a USB-C OTG adapter.", "RawBT will ask for USB permission. Tap Allow.", "Choose “RawBT” in the print dialog."] },
];

const problems = [
  ["Paper comes out blank", "The thermal roll is upside down. Scratch the paper with a fingernail. The side that turns black must face outward."],
  ["Print is too small or cut off", "In the print dialog, set Paper size to 80mm (or 58mm) and Margins to None. Pick the same size in Invoice Templates."],
  ["A web address and date print at the top", "In the print dialog, open More settings and turn off “Headers and footers”."],
  ["Printer does not show in the list", "Pair Bluetooth again, open RawBT and press “Test”, then restart the tablet."],
  ["Slips are not cut separately", "Print All sends each slip as its own job. Turn on auto cut in the printer settings."],
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
        <div><h2 className="font-display text-xl font-semibold">Printer Setup</h2><p className="text-xs text-muted-foreground">How to use a thermal printer from Chrome on an Android tablet, plus a test print.</p></div>

        <section className="rounded-xl border bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Printer className="size-4 text-primary" /> Test print</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">A sample customer receipt will print. Whichever size prints correctly, select it in <Link to="/invoice-templates" className="font-semibold text-primary underline">Invoice Templates</Link>. Current size: {invoiceSettings.paper}mm.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => setPaper("80")}><Printer /> Test Print 80mm</Button>
            <Button variant="outline" onClick={() => setPaper("58")}><Printer /> Test Print 58mm</Button>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold">What is paper size?</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg bg-muted p-3"><p className="font-semibold">80mm Standard (recommended)</p><p className="mt-1 text-muted-foreground">Roll width is about 8cm, around 48 letters per line. Used by most restaurant counter printers. Logo, items and total print clearly.</p></div>
            <div className="rounded-lg bg-muted p-3"><p className="font-semibold">58mm Small</p><p className="mt-1 text-muted-foreground">Roll width is about 5.8cm, around 32 letters per line. Used by small portable Bluetooth printers. Text prints smaller.</p></div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">How to check: measure the roll with a ruler, or look for “80mm” or “58mm” on the printer box or bottom sticker.</p>
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
          <h3 className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="size-4 text-primary" /> Troubleshooting</h3>
          <div className="mt-3 divide-y text-xs">{problems.map(([p, f]) => <div key={p} className="py-2"><p className="font-semibold">{p}</p><p className="text-muted-foreground">{f}</p></div>)}</div>
          <p className="mt-2 text-[11px] text-muted-foreground">Note: the app prints through the browser print dialog, so a printer app such as RawBT must be installed on the tablet.</p>
        </section>
      </div>
      {paper && createPortal(
        <div id="print-root" className={paper === "58" ? "paper-58" : ""}><PaperPrintStyle paper={paper} /><div className="print-page"><SampleCustomerSlip invoice={{ ...invoiceSettings, paper }} restaurant={restaurant} /></div></div>,
        document.body,
      )}
    </div>
  );
}
