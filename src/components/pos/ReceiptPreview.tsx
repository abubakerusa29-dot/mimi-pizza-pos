import { useOrder } from "./OrderContext";
import { Printer, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Button } from "@/components/ui/button";
import badge from "@/assets/mimis-badge.png.asset.json";
import wordmark from "@/assets/mimis-wordmark.png.asset.json";
import { restaurantInfo } from "@/data/menuData";
import { softwareCredit } from "@/data/softwareCredit";
import { type CartLine, cartTotals, formatRs, lineTotal } from "@/lib/cart";
import type { OrderType } from "./CartPanel";

interface Props {
  open: boolean;
  lines: CartLine[];
  orderNo: number;
  orderType: OrderType;
  table: string;
  date: Date;
  onBack: () => void;
}

export function ReceiptPreview({ open, lines, orderNo, orderType, table, date, onBack }: Props) {
  const { phone, address } = useOrder();
  const barcode = useRef<SVGSVGElement>(null);
  const [printNotice, setPrintNotice] = useState(false);
  useEffect(() => { setPrintNotice(false); }, [open]);
  useEffect(() => {
    if (!open || !barcode.current) return;
    JsBarcode(barcode.current, `MIMI-${orderNo}`, { format: "CODE128", width: 1.4, height: 38, displayValue: false, margin: 0 });
  }, [open, orderNo]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === "Escape") onBack(); };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open, onBack]);
  if (!open) return null;
  const { subtotal, total, items } = cartTotals(lines);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="invoice-title" className="receipt-overlay fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-foreground/70 px-4 pb-12 pt-5">
      <div className="no-print sticky top-0 z-10 mb-6 w-full max-w-[360px] rounded-lg border border-border bg-card p-3 shadow-lg">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="invoice-title" className="text-sm font-semibold">Invoice Preview</h2>
          <span className="font-mono text-xs text-muted-foreground">80mm · #{orderNo}</span>
        </div>
        <div className="flex gap-2">
        <Button autoFocus variant="outline" onClick={onBack} className="h-10 flex-1 text-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Order
        </Button>
        <Button onClick={() => setPrintNotice(true)} className="h-10 flex-1 text-xs font-bold">
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
        </div>
        {printNotice && <p role="status" className="mt-3 text-xs leading-relaxed text-muted-foreground">Printer connection will be added later.</p>}
      </div>
      <div id="receipt" className="thermal-receipt">
        <div className="text-center">
          <img src={badge.url} alt="Mimi’s Pizza" width={150} height={138} className="thermal-logo mx-auto mb-1 h-[138px] w-[150px] object-contain" />
          <p className="text-[10px] leading-snug">{restaurantInfo.address}</p>
          <p className="text-[10px]">Ph: {restaurantInfo.phone}</p>
          <p className="mt-3 font-bold">CUSTOMER RECEIPT</p>
        </div>
        <div className="receipt-divider" />
        <div className="flex justify-between"><span>Order #</span><span>{orderNo}</span></div>
        <div className="flex justify-between"><span>Date</span><span>{date.toLocaleDateString("en-GB")}</span></div>
        <div className="flex justify-between"><span>Time</span><span>{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span></div>
        <div className="flex justify-between"><span>Type</span><span>{orderType}</span></div>
        {orderType === "Dine-in" && table && <div className="flex justify-between"><span>Table</span><span>{table}</span></div>}
        {orderType === "Delivery" && phone && <div className="flex justify-between gap-2"><span>Phone</span><span>{phone}</span></div>}
        {orderType === "Delivery" && address && <div className="mt-1"><span>Address:</span><span className="block break-words">{address}</span></div>}
        <div className="receipt-divider" />
        <div className="grid grid-cols-[minmax(0,1fr)_24px_70px] gap-x-2 font-bold"><span>ITEM</span><span className="text-right">QTY</span><span className="text-right">PKR</span></div>
        {lines.map((l) => (
          <div key={l.key} className="mt-3">
            <div className="grid grid-cols-[minmax(0,1fr)_24px_70px] gap-x-2">
              <span className="min-w-0 break-words">{l.name}{l.variant && <span className="block text-[10px]">{l.variant}</span>}{l.addons?.length ? <span className="block text-[10px]">+ {l.addons.join(", ")}</span> : null}</span>
              <span className="text-right">{l.qty}</span>
              <span className="text-right">{lineTotal(l).toLocaleString("en-US")}</span>
            </div>
            <div className="text-[10px] opacity-70">@ {formatRs(l.unitPrice)}</div>
          </div>
        ))}
        <div className="receipt-divider" />
        <div className="mb-1 flex justify-between"><span>Items</span><span>{items}</span></div>
        <div className="flex justify-between"><span>Subtotal</span><span>{formatRs(subtotal)}</span></div>
        <div className="receipt-divider" />
        <div className="flex justify-between text-base font-bold"><span>TOTAL</span><span>{formatRs(total)}</span></div>
        <div className="receipt-divider" />
        <div className="mt-auto pt-5 text-center">
          <p>Thank you for your order!</p>
          <p className="mt-1 text-[10px]">Please visit again</p>
          <svg ref={barcode} role="img" aria-label={`Barcode for order ${orderNo}`} className="receipt-barcode mx-auto mt-5" />
          <p className="mt-2 text-[10px]">MIMI-{orderNo}</p>
          <p className="mt-4 text-[9px]">*** CUSTOMER COPY ***</p>
          <img src={wordmark.url} alt="" width={140} height={29} className="thermal-logo mx-auto mt-4 h-auto w-[140px] object-contain" />
          <div className="mt-3 border-t border-dashed border-current pt-2 text-[9px] leading-tight">
            <p>Software by {softwareCredit.name}</p>
            <p>{softwareCredit.website}{softwareCredit.phone && ` · ${softwareCredit.phone}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
