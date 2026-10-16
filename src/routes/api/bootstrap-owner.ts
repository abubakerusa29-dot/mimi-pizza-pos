import { createFileRoute } from "@tanstack/react-router";

// Temporary one-time setup route; removed after the owner login is created.
export const Route = createFileRoute("/api/bootstrap-owner")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 5 });
        if (data.users.length) return Response.json({ created: false, count: data.users.length });
        const { error } = await supabaseAdmin.auth.admin.createUser({ email: "admin@mimis.pk", password: "MimiPizza2026", email_confirm: true });
        return Response.json({ created: !error, error: error?.message });
      },
    },
  },
});
