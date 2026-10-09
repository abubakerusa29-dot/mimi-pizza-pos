import { createFileRoute } from "@tanstack/react-router";
import { ChartNoAxesCombined } from "lucide-react";
import { FuturePage } from "@/components/pos/FuturePage";
export const Route = createFileRoute("/sales")({
  head: () => ({ meta: [{ title: "Overall Sales — Mimi’s Pizza" }, { name: "description", content: "Overall sales preview for Mimi’s Pizza’s final POS software." }, { property: "og:title", content: "Overall Sales — Mimi’s Pizza" }, { property: "og:description", content: "Sales reporting is coming in the final software. This is a demo." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FuturePage title="Overall Sales" icon={ChartNoAxesCombined} />,
});