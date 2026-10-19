// Direct thermal printing for Android through the RawBT driver app.
// Builds plain ESC/POS text per slip and hands it to RawBT, bypassing the
// Android system print dialog (which often picks offline printers or label sizes).
import { type CartLine, cartTotals, formatRs, lineTotal } from "./cart";
import { softwareCredit } from "@/data/softwareCredit";

export type ThermalKind = "customer" | "kitchen" | "rider";
export interface ThermalOrder {
  kind: ThermalKind; lines: CartLine[]; orderNo: number; orderType: string; table: string; date: Date;
  phone: string; address: string; rider?: string; area?: string;
  restaurant: { address: string; phone: string }; footer?: string; paper: "80" | "58";
}

const ESC = "\x1b", GS = "\x1d";
const INIT = ESC + "@", CENTER = ESC + "a1", LEFT = ESC + "a0";
const BOLD = ESC + "E1", NOBOLD = ESC + "E0", BIG = GS + "!\x11", NORMAL = GS + "!\x00";
const CUT = "\n\n\n\n\n\n" + GS + "V\x41\x03";

const clean = (s: string) => s.replace(/[’‘]/g, "'").replace(/[–—]/g, "-").replace(/·/g, "-").replace(/[^\x20-\x7e\n]/g, "");
const row = (l: string, r: string, w: number) => {
  l = clean(l); r = clean(r);
  const space = w - l.length - r.length;
  return space >= 1 ? l + " ".repeat(space) + r : l + "\n" + " ".repeat(Math.max(0, w - r.length)) + r;
};

export function buildEscPos(o: ThermalOrder): string {
  const w = o.paper === "58" ? 32 : 48;
  const line = "-".repeat(w) + "\n";
  const { total, items, subtotal } = cartTotals(o.lines);
  const time = o.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const title = o.kind === "kitchen" ? "KITCHEN SLIP" : o.kind === "rider" ? "RIDER SLIP" : "MIMI'S PIZZA";
  const sub = o.orderType === "Dine-in" ? `DINE-IN${o.table ? " - TABLE " + o.table : ""}` : o.orderType.toUpperCase();
  let s = INIT + CENTER + BOLD + BIG + clean(title) + "\n" + NORMAL + sub + "\n" + NOBOLD;
  if (o.kind === "customer") s += clean(o.restaurant.address) + "\n" + "Ph: " + o.restaurant.phone + "\n";
  s += LEFT + line;
  s += row("Order #", String(o.orderNo), w) + "\n" + row("Date", `${o.date.toLocaleDateString("en-GB")} ${time}`, w) + "\n" + row("Type", o.orderType, w) + "\n";
  if (o.orderType === "Delivery" && o.kind !== "kitchen") {
    if (o.phone) s += row("Phone", o.phone, w) + "\n";
    if (o.address) s += "Address: " + clean(o.address) + "\n";
    if (o.area) s += row("Area", o.area, w) + "\n";
    if (o.kind === "rider" && o.rider) s += row("Rider", o.rider, w) + "\n";
  }
  s += line;
  for (const l of o.lines) {
    const name = `${l.qty} x ${l.name}${l.variant && o.kind !== "kitchen" ? ` (${l.variant})` : ""}`;
    if (o.kind === "kitchen") {
      s += BOLD + clean(name) + NOBOLD + "\n";
      if (l.variant) s += "  " + clean(l.variant) + "\n";
      if (l.key.startsWith("deal-") && l.description) for (const p of l.description.split(",")) if (p.trim()) s += "  - " + clean(p.trim()) + "\n";
    } else s += row(name, o.kind === "customer" ? formatRs(lineTotal(l)) : "", w) + "\n";
    if (l.addons?.length) s += "  + " + clean(l.addons.join(", ")) + "\n";
  }
  s += line;
  if (o.kind === "kitchen") s += CENTER + BOLD + `Total items: ${items}` + NOBOLD + "\n";
  else {
    s += row("Items", String(items), w) + "\n" + row("Subtotal", formatRs(subtotal), w) + "\n";
    s += BOLD + row(o.kind === "rider" ? "CASH TO COLLECT" : "TOTAL", formatRs(total), w) + NOBOLD + "\n";
    if (o.kind === "customer" && o.footer) s += CENTER + clean(o.footer) + "\n";
    if (o.kind === "customer") {
      const url = `https://mimispizza.site/track?id=${o.orderNo}`;
      const len = url.length + 3;
      const qr = GS + "(k\x04\x001A2\x00" + GS + "(k\x03\x001C\x06" + GS + "(k\x03\x001E1" +
        GS + "(k" + String.fromCharCode(len % 256, Math.floor(len / 256)) + "1P0" + url + GS + "(k\x03\x001Q0";
      s += CENTER + "\n" + BOLD + "SCAN FOR LIVE ORDER TRACKING" + NOBOLD + "\n" + qr + "\n" + url.replace("https://", "") + "\n" + BOLD + "Tracking ID: " + o.orderNo + NOBOLD + "\n";
    }
  }
  s += CENTER + "\nSoftware by " + softwareCredit.name + "\n";
  if (o.kind !== "kitchen") s += softwareCredit.website.replace(/^https?:\/\//, "").replace(/\/$/, "") + " - " + softwareCredit.phone + "\n";
  return s + CUT;
}

/** Latin-1 safe base64 of the raw byte string. */
export function toBase64(raw: string) {
  let bin = "";
  for (let i = 0; i < raw.length; i++) bin += String.fromCharCode(raw.charCodeAt(i) & 0xff);
  return btoa(bin);
}

export const rawbtUrl = (raw: string) =>
  `intent:base64,${toBase64(raw)}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;

/** Sends one slip to RawBT. Must be called from a user tap. */
export function sendToRawBT(raw: string) {
  window.location.href = rawbtUrl(raw);
}

export const isAndroid = () => typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
