// Public digital-menu / tracking settings. Change TRACK_DOMAIN when the final domain is live.
export const TRACK_DOMAIN = "https://demo-mimi-pizza.ebpk.site";
export const TRACK_URL = `${TRACK_DOMAIN}/track`;
export const WHATSAPP_NUMBER = "923124607733";
export const CALL_NUMBER = "+923124607733";
export const whatsappLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
/** Public pages render without the private POS shell. */
export const isPublicPath = (path: string) => path === "/" || path === "/menu" || path.startsWith("/track");
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Mimi’s Pizza, Main Qasba Road, Near Muhammadi Masjid, Lalamusa");
