import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/tmp-bootstrap")({
  server: { handlers: { POST: async ({ request }) => {
    const b = (await request.json()) as { email: string; password: string };
    if (b.email !== "abubakerusa29@gmail.com") return new Response("no", { status: 403 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.createUser({ email: b.email, password: b.password, email_confirm: true });
    return Response.json({ ok: !error, error: error?.message ?? null });
  } } },
});
