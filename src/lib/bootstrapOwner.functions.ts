import { createServerFn } from "@tanstack/react-start";

// Temporary one-time setup: creates the owner login only when no account exists.
export const bootstrapOwner = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 5 });
  if (data.users.length) return { created: false, count: data.users.length };
  const { error } = await supabaseAdmin.auth.admin.createUser({ email: "admin@mimis.pk", password: "MimiPizza2026", email_confirm: true });
  if (error) return { created: false, error: error.message };
  return { created: true };
});
