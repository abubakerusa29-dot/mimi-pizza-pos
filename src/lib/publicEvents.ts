import { supabase } from "@/integrations/supabase/client";

export type PublicEventKind = "visit" | "whatsapp_order" | "track_search";

/** Fire-and-forget visitor activity log. Never blocks or breaks the public page. */
export function logPublicEvent(kind: PublicEventKind, label = "", amount = 0) {
  try {
    void supabase.from("public_events").insert({ kind, label: label.slice(0, 200), amount: Math.max(0, Math.round(amount)) }).then(() => {});
  } catch { /* ignore */ }
}
