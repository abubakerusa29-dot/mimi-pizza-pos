import { TRACK_URL } from "@/data/publicSite";
import { formatRs } from "@/lib/cart";

/** Converts a Pakistani number (03xx..., +92..., 92...) to wa.me format (923xx...). Returns "" when not usable. */
export function toWhatsAppNumber(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0092")) d = d.slice(2);
  if (d.startsWith("0")) d = "92" + d.slice(1);
  else if (d.startsWith("3") && d.length === 10) d = "92" + d;
  return /^923\d{9}$/.test(d) ? d : "";
}

export function trackingMessage(o: { name?: string | undefined; orderNo: number; total: number }): string {
  const hi = o.name ? `Assalam-o-alaikum ${o.name}!` : "Assalam-o-alaikum!";
  return `${hi} Aapka Mimi's Pizza order #${o.orderNo} confirm ho gaya hai.\nTotal bill: ${formatRs(o.total)}\n\nApna order live track karein:\n${TRACK_URL}?id=${o.orderNo}\n\nShukriya! Mimi's Pizza Lalamusa`;
}

export function customerWhatsAppLink(phone: string, text: string): string {
  const n = toWhatsAppNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : "";
}
