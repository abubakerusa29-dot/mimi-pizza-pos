import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { FuturePage } from "@/components/pos/FuturePage";
export const Route = createFileRoute("/invoices")({
  head: () => ({ meta: [{ title: "Previous Invoices — Mimi’s Pizza" }, { name: "description", content: "Previous invoices preview for Mimi’s Pizza’s POS software." }, { property: "og:title", content: "Previous Invoices — Mimi’s Pizza" }, { property: "og:description", content: "Invoice history is coming soon." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FuturePage title="Previous Invoices" icon={History} />,
});