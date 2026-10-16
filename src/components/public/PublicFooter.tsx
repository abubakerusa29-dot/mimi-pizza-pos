import { MapPin, Clock, Phone, MessageCircle, Bike } from "lucide-react";
import badge from "@/assets/mimis-primary-logo.png.asset.json";
import { restaurantInfo } from "@/data/menuData";
import { CALL_NUMBER, MAPS_URL, whatsappLink } from "@/data/publicSite";
import { softwareCredit } from "@/data/softwareCredit";

export function PublicFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2"><img src={badge.url} alt="" className="size-12 object-contain" /><span className="font-display text-xl font-bold">Mimi’s Pizza</span></div>
          <p className="mt-3 text-sm opacity-75">A taste that you will remember. Fresh pizzas, burgers and deals in Lalamusa.</p>
        </div>
        <div>
          <h3 className="font-bold">Quick links</h3>
          <ul className="mt-3 space-y-2 text-sm opacity-75">
            <li><a href="/#track" className="hover:opacity-100">Track your order</a></li>
            <li><a href="/#menu" className="hover:opacity-100">Digital menu</a></li>
            <li><a href="/#contact" className="hover:opacity-100">Contact and location</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold">Visit us</h3>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-3 flex gap-2 text-sm opacity-75 hover:opacity-100"><MapPin className="size-4 shrink-0 text-primary" />{restaurantInfo.address}</a>
          <p className="mt-2 flex gap-2 text-sm opacity-75"><Clock className="size-4 shrink-0 text-primary" />{restaurantInfo.hours}</p>
          <p className="mt-2 flex gap-2 text-sm opacity-75"><Bike className="size-4 shrink-0 text-primary" />{restaurantInfo.delivery}</p>
        </div>
        <div>
          <h3 className="font-bold">Order now</h3>
          <a href={whatsappLink("Assalam-o-alaikum Mimi’s Pizza, I want to place an order.")} target="_blank" rel="noopener noreferrer" className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground"><MessageCircle className="size-4" />WhatsApp Order</a>
          <a href={`tel:${CALL_NUMBER}`} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl border border-background/30 font-bold"><Phone className="size-4" />Call {restaurantInfo.phone}</a>
        </div>
      </div>
      <div className="border-t border-background/15 px-4 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Mimi’s Pizza Lalamusa · Made by <a href={softwareCredit.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">{softwareCredit.name}</a> · {softwareCredit.phone}
        <a href="/pos" className="mt-2 block opacity-60 hover:opacity-100">🔒 Staff Portal</a>
      </div>
    </footer>
  );
}
