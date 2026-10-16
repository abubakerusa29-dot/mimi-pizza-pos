import { useOrder } from "./OrderContext";
import { Printer, ArrowLeft, CheckCircle2, RotateCcw, Bluetooth } from "lucide-react";
import { buildEscPos, sendToRawBT } from "@/lib/thermalPrint";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import JsBarcode from "jsbarcode";
import { Button } from "@/components/ui/button";
import badge from "@/assets/mimis-primary-logo.png.asset.json";
import wordmark from "@/assets/mimis-wordmark.png.asset.json";
import { restaurantInfo } from "@/data/menuData";
import { softwareCredit } from "@/data/softwareCredit";
import { QRCodeSVG } from "qrcode.react";
import { TRACK_URL } from "@/data/publicSite";

type RestaurantInfo = typeof restaurantInfo;
import { type CartLine, cartTotals, formatRs, lineTotal } from "@/lib/cart";
import type { OrderType } from "./CartPanel";
import type { InvoiceSettings } from "@/lib/invoiceTemplates";

export type SlipKind = "customer" | "kitchen" | "rider";
const slipLabels: Record<SlipKind, string> = { customer: "Customer", kitchen: "Kitchen", rider: "Delivery Rider" };

/** Dine-in & Takeaway get kitchen + customer slips; Delivery also gets a rider slip. */
export function slipsFor(orderType: OrderType): SlipKind[] {
  return orderType === "Delivery" ? ["kitchen", "customer", "rider"] : ["kitchen", "customer"];
}

interface Props {
  open: boolean;
  lines: CartLine[];
  orderNo: number;
  orderType: OrderType;
  table: string;
  date: Date;
  onBack: () => void;
  /** Called when the cashier confirms all slips printed; starts the next order. */
  onDone?: () => void;
  /** Reprints pass stored customer details; live orders read them from the current order. */
  phone?: string;
  address?: string;
  rider?: string;
  area?: string;
}

interface SlipProps { kind: SlipKind; lines: CartLine[]; orderNo: number; orderType: OrderType; table: string; date: Date; phone: string; address: string; rider?: string; area?: string; restaurant: RestaurantInfo; invoice: InvoiceSettings }

function Credit() {
  return (
    <div className="mt-3 border-t border-dashed border-current pt-2 text-center text-[9px] leading-tight">
      <p>Software by {softwareCredit.name}</p>
      <p>{softwareCredit.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} · {softwareCredit.phone}</p>
    </div>
  );
}

/** One fixed QR code to the public tracking page; the order number is printed below it. */
function TrackQr({ orderNo }: { orderNo: number }) {
  return (
    <div className="mt-3 border-t border-dashed border-current pt-2">
      <p className="text-[11px] font-bold">SCAN TO TRACK YOUR ORDER LIVE</p>
      <QRCodeSVG value={TRACK_URL} size={110} level="M" marginSize={1} bgColor="#ffffff" fgColor="#000000" className="mx-auto my-1" aria-label="Order tracking QR code" />
      <p className="text-[10px]">{TRACK_URL.replace(/^https?:\/\//, "")}</p>
      <p className="text-[11px] font-bold">Tracking ID: {orderNo}</p>
    </div>
  );
}

function Barcode({ orderNo }: { orderNo: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) JsBarcode(ref.current, `MIMI-${orderNo}`, { format: "CODE128", width: 1.4, height: 38, displayValue: false, margin: 0 });
  }, [orderNo]);
  return <svg ref={ref} role="img" aria-label={`Barcode for order ${orderNo}`} className="receipt-barcode mx-auto mt-4" />;
}

/** Deal contents for the kitchen: the deal's included items, one per line. */
export function dealParts(l: Pick<CartLine, "key" | "description">): string[] {
  if (!l.key.startsWith("deal-") || !l.description) return [];
  return l.description.split(",").map((s) => s.trim()).filter(Boolean);
}

function SlipBanner({ title, orderType, table }: { title: string; orderType: OrderType; table: string }) {
  const sub = orderType === "Dine-in" ? `DINE-IN${table ? ` · TABLE ${table}` : ""}` : orderType.toUpperCase();
  return (
    <div className="slip-banner my-2 text-center">
      <p className="text-[15px] font-bold tracking-wide">{title}</p>
      <p className="text-[12px] font-bold">{sub}</p>
    </div>
  );
}

function Slip({ kind, lines, orderNo, orderType, table, date, phone, address, rider, area, restaurant, invoice }: SlipProps) {
  const { total, items } = cartTotals(lines);
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const meta = (
    <>
      <div className="flex justify-between"><span>Order #</span><span className="font-bold">{orderNo}</span></div>
      <div className="flex justify-between"><span>Date</span><span>{date.toLocaleDateString("en-GB")} {time}</span></div>
      <div className="flex justify-between"><span>Type</span><span className="font-bold">{orderType}</span></div>
      {orderType === "Dine-in" && table && <div className="flex justify-between"><span>Table</span><span className="font-bold">{table}</span></div>}
    </>
  );
  const customerInfo = orderType === "Delivery" && (
    <>
      {phone && <div className="flex justify-between gap-2"><span>Phone</span><span className="font-bold">{phone}</span></div>}
      {address && <div className="mt-1"><span>Address:</span><span className="block break-words font-bold">{address}</span></div>}
    </>
  );

  if (kind === "kitchen") {
    const kt = invoice.kitchenTemplate;
    const box = kt === "checklist" ? "[ ] " : "";
    return (
      <div className={`thermal-receipt slip-compact ${kt === "large" ? "kitchen-large" : ""}`}>
        <SlipBanner title="KITCHEN SLIP" orderType={orderType} table={table} />
        {meta}
        <div className="receipt-divider" />
        {lines.map((l) => {
          const parts = dealParts(l);
          return (
            <div key={l.key} className={kt === "checklist" ? "mt-2 border-b border-dashed border-current pb-2" : "mt-2"}>
              <p className={`${kt === "large" ? "text-[18px]" : "text-[14px]"} font-bold`}>{box}{l.qty} x {l.name}</p>
              {l.variant && <p className="pl-4 font-bold">{parts.length ? "Pizza flavour: " : ""}{l.variant}</p>}
              {parts.map((p) => <p key={p} className="pl-4">{box || "- "}{p}</p>)}
              {l.addons?.length ? <p className="pl-4 font-bold">+ ADD: {l.addons.join(", ")}</p> : null}
            </div>
          );
        })}
        <div className="receipt-divider" />
        <p className="text-center font-bold">Total items: {items}</p>
        {kt === "checklist" && <p className="mt-2">Checked by: ______________</p>}
        <p className="mt-2 text-center text-[9px] leading-tight">Software by {softwareCredit.name}</p>
      </div>
    );
  }

  if (kind === "rider") {
    const rt = invoice.riderTemplate;
    const items = rt !== "compact" && (
      <>
        <div className="receipt-divider" />
        {lines.map((l) => (
          <div key={l.key} className="flex justify-between gap-2"><span className="min-w-0 break-words">{l.qty} x {l.name}{l.variant ? ` (${l.variant})` : ""}</span><span className="font-bold">{lineTotal(l).toLocaleString("en-US")}</span></div>
        ))}
      </>
    );
    return (
      <div className="thermal-receipt slip-compact">
        <p className="text-center text-sm font-bold">Mimi’s Pizza</p>
        <SlipBanner title="DELIVERY RIDER SLIP" orderType={orderType} table={table} />
        {meta}
        {rt === "cash" ? (
          <div className="receipt-box mt-2">
            {phone && <p className="text-[14px] font-bold">{phone}</p>}
            {address && <p className="break-words text-[14px] font-bold">{address}</p>}
            {area && <p>Area: <span className="font-bold">{area}</span></p>}
          </div>
        ) : customerInfo}
        {items}
        <div className="receipt-divider" />
        {rt === "cash"
          ? <div className="receipt-invert my-1 px-2 py-2 text-center"><p className="text-[12px] font-bold">COLLECT CASH</p><p className="text-xl font-bold">{formatRs(total)}</p></div>
          : <div className="flex justify-between text-base font-bold"><span>COLLECT CASH</span><span>{formatRs(total)}</span></div>}
        <div className="receipt-divider" />
        {rt !== "cash" && area && <p className="mt-1">Area: <span className="font-bold">{area}</span></p>}
        <p className="mt-3">Rider: {rider ? <span className="font-bold">{rider}</span> : "____________________"}</p>
        {rt !== "compact" && <p className="mt-3">Received by: ______________</p>}
        <Credit />
      </div>
    );
  }

  return <CustomerSlip {...{ lines, orderNo, orderType, table, date, restaurant, invoice, meta, customerInfo }} />;
}

/** Customer receipt in the owner's chosen template. The software credit always prints and cannot be turned off. */
function CustomerSlip({ lines, orderNo, orderType, table, restaurant, invoice, meta, customerInfo }: { lines: CartLine[]; orderNo: number; orderType: OrderType; table: string; date: Date; restaurant: RestaurantInfo; invoice: InvoiceSettings; meta: React.ReactNode; customerInfo: React.ReactNode }) {
  const { subtotal, total, items } = cartTotals(lines);
  const t = invoice.template;
  const compact = t === "compact" || t === "minimal";
  const logoSrc = invoice.customLogo || badge.url;
  const showBadge = t !== "minimal" && (invoice.logo === "badge" || invoice.logo === "both");
  const showWordmark = invoice.logo === "wordmark" || invoice.logo === "both";
  const badgeSize = t === "bold" ? 170 : compact ? 90 : 138;
  const boxed = t === "boxed";
  if (t === "premium" || t === "retail") {
    const retail = t === "retail";
    return (
      <div className={`thermal-receipt tpl-${t}`}>
        <div className="text-center">
          {showBadge && <img src={logoSrc} alt="Restaurant logo" style={{ width: 110, height: 101 }} className="thermal-logo mx-auto mb-1 object-contain" />}
          {showWordmark && <img src={wordmark.url} alt="" width={150} height={31} className="thermal-logo mx-auto mb-1 h-auto w-[150px] object-contain" />}
          <p className="text-[10px] leading-snug">{restaurant.address}</p>
          <p className="text-[10px]">Phone # {restaurant.phone}</p>
        </div>
        <SlipBanner title={retail ? "SALES INVOICE" : "CUSTOMER RECEIPT"} orderType={orderType} table={table} />
        <div className={retail ? "" : "receipt-box"}>{meta}{customerInfo}</div>
        <table className="receipt-table text-[11px]">
          <thead><tr>{retail && <th>Sr</th>}<th className="text-left">Item</th><th>Qty</th><th className="text-right">Rate</th><th className="text-right">Amnt</th></tr></thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l.key}>
                {retail && <td className="text-center">{i + 1}</td>}
                <td className="break-words">{l.name}{l.variant && <span className="block text-[10px]">{l.variant}</span>}{l.addons?.length ? <span className="block text-[10px]">+ {l.addons.join(", ")}</span> : null}</td>
                <td className="text-center">{l.qty}</td>
                <td className="text-right">{l.unitPrice.toLocaleString("en-US")}</td>
                <td className="text-right">{lineTotal(l).toLocaleString("en-US")}</td>
              </tr>
            ))}
            <tr className="font-bold">{retail && <td />}<td>Total</td><td className="text-center">{items}</td><td /><td className="text-right">{subtotal.toLocaleString("en-US")}</td></tr>
          </tbody>
        </table>
        <div className={retail ? "" : "receipt-box"}>
          <div className="flex justify-between"><span>Sub total</span><span>{formatRs(subtotal)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>{formatRs(0)}</span></div>
          <div className="mt-1 flex justify-between text-lg font-bold"><span>{retail ? "Net Total" : "GRAND TOTAL"}</span><span>{formatRs(total)}</span></div>
        </div>
        <div className="pt-3 text-center">
          {invoice.footer && <p className="whitespace-pre-line">{invoice.footer}</p>}
          {orderType !== "Dine-in" && <TrackQr orderNo={orderNo} />}
          {invoice.showBarcode && <><Barcode orderNo={orderNo} /><p className="mt-2 text-[10px]">MIMI-{orderNo}</p></>}
        </div>
        <Credit />
      </div>
    );
  }
  return (
    <div className={`thermal-receipt tpl-${t}`}>
      <div className={`text-center ${boxed ? "receipt-box" : ""}`}>
        {showBadge && <img src={logoSrc} alt="Restaurant logo" style={{ width: badgeSize, height: badgeSize * 0.92 }} className="thermal-logo mx-auto mb-1 object-contain" />}
        {t === "minimal" && <p className="text-[15px] font-bold">MIMI’S PIZZA</p>}
        {t === "bold" && showWordmark && <img src={wordmark.url} alt="" width={160} height={33} className="thermal-logo mx-auto mb-1 h-auto w-[160px] object-contain" />}
        <p className="text-[10px] leading-snug">{restaurant.address}</p>
        <p className="text-[10px]">Ph: {restaurant.phone}</p>
      </div>
      {t === "bold"
        ? <div className="receipt-invert my-2 py-1 text-center"><p className="text-[15px] font-bold">CUSTOMER RECEIPT</p><p className="text-[12px] font-bold">{orderType === "Dine-in" && table ? `DINE-IN · TABLE ${table}` : orderType.toUpperCase()}</p></div>
        : t === "minimal" ? <p className="my-2 text-center font-bold">RECEIPT · {orderType.toUpperCase()}</p>
        : <SlipBanner title="CUSTOMER RECEIPT" orderType={orderType} table={table} />}
      {!compact && <div className="receipt-divider" />}
      <div className={boxed ? "receipt-box" : ""}>{meta}{customerInfo}</div>
      <div className={compact ? "receipt-divider tight" : "receipt-divider"} />
      <div className="grid grid-cols-[minmax(0,1fr)_24px_70px] gap-x-2 font-bold"><span>ITEM</span><span className="text-right">QTY</span><span className="text-right">PKR</span></div>
      {lines.map((l) => (
        <div key={l.key} className={compact ? "mt-1" : "mt-3"}>
          <div className="grid grid-cols-[minmax(0,1fr)_24px_70px] gap-x-2">
            <span className="min-w-0 break-words">{l.name}{l.variant && <span className="block text-[10px]">{l.variant}</span>}{l.addons?.length ? <span className="block text-[10px]">+ {l.addons.join(", ")}</span> : null}</span>
            <span className="text-right">{l.qty}</span>
            <span className="text-right">{lineTotal(l).toLocaleString("en-US")}</span>
          </div>
          {!compact && <div className="text-[10px] opacity-70">@ {formatRs(l.unitPrice)}</div>}
        </div>
      ))}
      <div className={compact ? "receipt-divider tight" : "receipt-divider"} />
      <div className={boxed ? "receipt-box" : ""}>
        <div className="mb-1 flex justify-between"><span>Items</span><span>{items}</span></div>
        <div className="flex justify-between"><span>Subtotal</span><span>{formatRs(subtotal)}</span></div>
      </div>
      {t === "bold"
        ? <div className="receipt-invert my-2 flex justify-between px-2 py-1 text-lg font-bold"><span>TOTAL</span><span>{formatRs(total)}</span></div>
        : <><div className={compact ? "receipt-divider tight" : "receipt-divider"} /><div className={`flex justify-between text-base font-bold ${boxed ? "receipt-box" : ""}`}><span>TOTAL</span><span>{formatRs(total)}</span></div></>}
      <div className={compact ? "receipt-divider tight" : "receipt-divider"} />
      <div className={compact ? "pt-1 text-center" : "pt-3 text-center"}>
        {invoice.footer && <p className="whitespace-pre-line">{invoice.footer}</p>}
        {invoice.showBarcode && <><Barcode orderNo={orderNo} /><p className="mt-2 text-[10px]">MIMI-{orderNo}</p></>}
        {t !== "bold" && t !== "minimal" && showWordmark && <img src={wordmark.url} alt="" width={140} height={29} className="thermal-logo mx-auto mt-4 h-auto w-[140px] object-contain" />}
      </div>
      <Credit />
    </div>
  );
}

/** Sample order used by the template preview and the printer test page. */
export function SampleCustomerSlip({ invoice, restaurant, kind = "customer" }: { invoice: InvoiceSettings; restaurant: RestaurantInfo; kind?: SlipKind }) {
  const lines: CartLine[] = [
    { key: "pz-sample", name: "Chicken Tikka Pizza", variant: "Medium", unitPrice: 1450, qty: 1 } as CartLine,
    { key: "deal-sample", name: "Family Deal", description: "1 Large Pizza, 2 Zinger Burgers, 1.5L Drink", variant: "Fajita", unitPrice: 2899, qty: 1 } as CartLine,
    { key: "dr-sample", name: "Drink 1.5L", unitPrice: 250, qty: 2 } as CartLine,
  ];
  const delivery = kind === "rider";
  return <Slip kind={kind} lines={lines} orderNo={1234} orderType={delivery ? "Delivery" : "Takeaway"} table="" date={new Date()} phone={delivery ? "0300 1234567" : ""} address={delivery ? "House 12, Street 4, Model Town" : ""} rider={delivery ? "Rider 1" : ""} area={delivery ? "Model Town" : ""} restaurant={restaurant} invoice={invoice} />;
}

/** Sends one browser print job sized for the chosen paper width. */
export function PaperPrintStyle({ paper }: { paper: "80" | "58" }) {
  return <style>{`@media print { @page { size: ${paper}mm auto; margin: 0; } html, body { width: ${paper}mm !important; } #print-root .thermal-receipt { width: ${paper}mm !important; max-width: ${paper}mm !important; } }`}</style>;
}

export function ReceiptPreview({ open, lines, orderNo, orderType, table, date, onBack, onDone, phone: phoneProp, address: addressProp, rider: riderProp, area: areaProp }: Props) {
  const order = useOrder();
  const phone = phoneProp ?? order.phone;
  const address = addressProp ?? order.address;
  const available = slipsFor(orderType);
  const [view, setView] = useState<SlipKind | "all">("all");
  const [printing, setPrinting] = useState<SlipKind[] | null>(null);
  const [jobIndex, setJobIndex] = useState(0);
  const sentJob = useRef("");
  const printRun = useRef(0);
  const openedAt = useRef(0);
  const [printed, setPrinted] = useState(false);
  useEffect(() => { if (open) { setView("all"); setPrinted(false); openedAt.current = Date.now(); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") onBack(); };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open, onBack]);
  // Each slip is sent as its own print job, one after another, so the printer
  // receives a separate signal (and cut) per slip.
  useEffect(() => {
    if (!printing) return;
    let cancelled = false;
    const root = document.getElementById("print-root");
    const imgs = Array.from(root?.querySelectorAll("img") ?? []);
    Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; })))).then(() => {
      requestAnimationFrame(() => {
        if (cancelled || sentJob.current === `${printRun.current}:${jobIndex}`) return;
        sentJob.current = `${printRun.current}:${jobIndex}`;
        window.print(); // blocks until this job is sent or cancelled
        setTimeout(() => {
          if (cancelled) return;
          if (jobIndex + 1 < printing.length) setJobIndex(jobIndex + 1);
          else { setPrinting(null); setJobIndex(0); setPrinted(true); }
        }, 400);
      });
    });
    return () => { cancelled = true; };
  }, [printing, jobIndex]);
  if (!open) return null;
  const shown = view === "all" ? available : available.filter((k) => k === view);
  const rider = riderProp ?? order.rider;
  const area = areaProp ?? order.area;
  const slipProps = { lines, orderNo, orderType, table, date, phone, address, rider, area, restaurant: order.restaurant, invoice: order.invoiceSettings };
  const paper = order.invoiceSettings.paper;
  const startPrint = (kinds: SlipKind[]) => {
    if (printing || Date.now() - openedAt.current < 500) return;
    printRun.current++;
    order.saveInvoice({ orderNo, date, lines, orderType, table, phone, address, rider, area, status: orderType === "Delivery" ? ("On the way" as const) : undefined });
    setJobIndex(0); setPrinting(kinds);
  };
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="invoice-title" className="receipt-overlay fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-foreground/70 px-4 pb-12 pt-5">
      <div className="no-print sticky top-0 z-10 mb-6 w-full max-w-[380px] rounded-lg border border-border bg-card p-3 shadow-lg">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="invoice-title" className="text-sm font-semibold">Print Preview</h2>
          <span className="font-mono text-xs text-muted-foreground">{printing ? `Printing ${jobIndex + 1}/${printing.length}` : `${paper}mm · #${orderNo}`}</span>
        </div>
        <div role="tablist" aria-label="Slip type" className="mb-3 grid gap-1 rounded-md bg-muted p-1" style={{ gridTemplateColumns: `repeat(${available.length + 1}, minmax(0, 1fr))` }}>
          {(["all", ...available] as const).map((k) => (
            <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)} className={`h-8 rounded px-1 text-[11px] font-semibold ${view === k ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}>
              {k === "all" ? `All (${available.length})` : slipLabels[k]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="h-10 flex-1 text-xs"><ArrowLeft className="h-4 w-4" /> Back</Button>
          <Button autoFocus onClick={() => startPrint(shown)} className="h-10 flex-[2] text-xs font-bold">
            <Printer className="h-4 w-4" /> {view === "all" ? `Print All ${available.length} Slips` : `Print ${slipLabels[view]} Slip`}
          </Button>
        </div>
        <Button variant="secondary" onClick={() => {
          if (printing) return;
          order.saveInvoice({ orderNo, date, lines, orderType, table, phone, address, rider, area, status: orderType === "Delivery" ? ("On the way" as const) : undefined });
          const raw = shown.map((k) => buildEscPos({ kind: k, lines, orderNo, orderType, table, date, phone, address, rider, area, restaurant: order.restaurant, footer: order.invoiceSettings.footer, paper })).join("");
          sendToRawBT(raw);
          setPrinted(true);
        }} className="mt-2 h-10 w-full text-xs font-bold">
          <Bluetooth className="h-4 w-4" /> Android Bluetooth Print (RawBT)
        </Button>
        <p className="mt-1 text-center text-[10px] text-muted-foreground">Android: install RawBT app once, select your Bluetooth printer in it. Slips print directly, each with a cut.</p>
        {printed && !printing && (
          <div className="mt-3 rounded-md border border-primary/40 bg-accent p-3">
            <p className="text-xs font-semibold">Did every slip print? If one was missed or cancelled, print it again:</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {available.map((k) => <Button key={k} size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => startPrint([k])}><RotateCcw className="h-3.5 w-3.5" /> {slipLabels[k]}</Button>)}
            </div>
            {onDone && <Button className="mt-2 h-10 w-full text-xs font-bold" onClick={onDone}><CheckCircle2 className="h-4 w-4" /> All printed. Start next order</Button>}
          </div>
        )}
      </div>
      {(() => {
        // Customer receipt is long; stack the short kitchen and rider slips in a column beside it.
        const card = (k: SlipKind) => (
          <div key={k} className="flex flex-col items-center gap-2">
            <span className="no-print rounded-full bg-card px-3 py-1 text-[11px] font-semibold text-foreground shadow">Slip {shown.indexOf(k) + 1} of {shown.length} · {slipLabels[k]}</span>
            <Slip kind={k} {...slipProps} />
          </div>
        );
        const side = shown.filter((k) => k !== "customer");
        return (
          <div className={`flex flex-wrap items-start justify-center gap-8 ${paper === "58" ? "paper-58" : ""}`}>
            {side.length > 0 && <div className="flex flex-col items-center gap-10">{side.map(card)}</div>}
            {shown.includes("customer") && card("customer")}
          </div>
        );
      })()}
      {printing && createPortal(
        <div id="print-root" className={paper === "58" ? "paper-58" : ""}><PaperPrintStyle paper={paper} /><div key={jobIndex} className="print-page"><Slip kind={printing[jobIndex] ?? "customer"} {...slipProps} /></div></div>,
        document.body,
      )}
    </div>
  );
}
