import { Printer, ArrowLeft } from "lucide-react";
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
  if (!open) return null;
  const { subtotal, total } = cartTotals(lines);
  return (
    <div className="receipt-overlay fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-foreground/60 p-4">
      <div className="no-print mb-3 flex w-full max-w-[340px] gap-2">
        <button onClick={onBack} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-card py-3 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Order
        </button>
        <button onClick={() => window.print()} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground">
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
      </div>
      <div id="receipt" className="w-full max-w-[302px] bg-card p-4 font-mono text-[12px] leading-snug text-card-foreground shadow-xl">
        <div className="text-center">
          <p className="text-lg font-bold">Mimi’s Pizza</p>
          <p>Restaurant Bill</p>
        </div>
        <div className="my-2 border-t border-dashed border-foreground" />
        <div className="flex justify-between"><span>Order #</span><span>{orderNo}</span></div>
        <div className="flex justify-between"><span>Date</span><span>{date.toLocaleDateString("en-GB")}</span></div>
        <div className="flex justify-between"><span>Time</span><span>{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span></div>
        <div className="flex justify-between"><span>Type</span><span>{orderType}</span></div>
        {orderType === "Dine-in" && table && <div className="flex justify-between"><span>Table</span><span>{table}</span></div>}
        <div className="my-2 border-t border-dashed border-foreground" />
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 font-bold"><span>Item</span><span>Qty</span><span className="text-right">Amount</span></div>
        {lines.map((l) => (
          <div key={l.key} className="mt-1.5">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-2">
              <span>{l.name}{l.variant ? ` (${l.variant})` : ""}</span>
              <span>{l.qty}</span>
              <span className="text-right">{lineTotal(l).toLocaleString("en-US")}</span>
            </div>
            <div className="text-[10px] opacity-70">@ {formatRs(l.unitPrice)}</div>
          </div>
        ))}
        <div className="my-2 border-t border-dashed border-foreground" />
        <div className="flex justify-between"><span>Subtotal</span><span>{formatRs(subtotal)}</span></div>
        <div className="flex justify-between text-sm font-bold"><span>TOTAL</span><span>{formatRs(total)}</span></div>
        <div className="my-2 border-t border-dashed border-foreground" />
        <p className="text-center">Thank you for dining with us!</p>
        <p className="text-center text-[10px] opacity-70">Please visit again</p>
      </div>
    </div>
  );
}
