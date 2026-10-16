import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isStaffPin } from "@/lib/staffPin";

const MAX_TRIES = 5;
const LOCK_MINUTES = 15;

const sessionConfig = () => ({
  password: process.env["SESSION_SECRET"]!,
  name: "mimi-staff-pin",
  maxAge: 60 * 60 * 12,
  cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
});

const hashPin = (pin: string) => createHash("sha256").update(`mimi-pin-v1:${pin}`, "utf8").digest("hex");
const same = (a: string, b: string) => timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;

export const getPinStatus = createServerFn({ method: "GET" }).handler(async () => {
  const s = await useSession<{ ok?: boolean }>(sessionConfig());
  return { ok: !!s.data.ok };
});

export const verifyStaffPin = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string }) => ({ pin: String(d?.pin ?? "") }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("pos_security").select("*").eq("id", 1).single();
    if (!row) return { ok: false as const, message: "PIN is not set up." };
    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      return { ok: false as const, message: "Too many wrong tries. Try again in 15 minutes." };
    }
    if (isStaffPin(data.pin) && same(hashPin(data.pin), row.pin_hash)) {
      await db.from("pos_security").update({ failed_attempts: 0, locked_until: null }).eq("id", 1);
      const s = await useSession<{ ok?: boolean }>(sessionConfig());
      await s.update({ ok: true });
      return { ok: true as const, message: "" };
    }
    const tries = row.failed_attempts + 1;
    const lock = tries >= MAX_TRIES;
    await db.from("pos_security").update({
      failed_attempts: lock ? 0 : tries,
      locked_until: lock ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
    }).eq("id", 1);
    return { ok: false as const, message: lock ? "Too many wrong tries. Try again in 15 minutes." : `Wrong PIN. ${MAX_TRIES - tries} tries left.` };
  });

export const changeStaffPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pin: string }) => ({ pin: String(d?.pin ?? "") }))
  .handler(async ({ data }) => {
    if (!isStaffPin(data.pin)) return { ok: false, message: "PIN must be exactly 6 digits." };
    const db = await admin();
    const { error } = await db.from("pos_security").update({ pin_hash: hashPin(data.pin), failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() }).eq("id", 1);
    return error ? { ok: false, message: "Could not save the PIN." } : { ok: true, message: "Staff PIN changed." };
  });
