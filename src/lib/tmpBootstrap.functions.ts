import { createServerFn } from "@tanstack/react-start";

export const tmpBootstrapOwner = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    if (data.email !== "abubakerusa29@gmail.com") throw new Error("no");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.createUser({ email: data.email, password: data.password, email_confirm: true });
    return { ok: !error, error: error?.message ?? null };
  });
