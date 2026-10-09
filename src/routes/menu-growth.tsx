import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { FuturePage } from "@/components/pos/FuturePage";
export const Route = createFileRoute("/menu-growth")({
  head: () => ({ meta: [{ title: "Menu Growth — Mimi’s Pizza" }, { name: "description", content: "Menu growth preview for Mimi’s Pizza’s final POS software." }, { property: "og:title", content: "Menu Growth — Mimi’s Pizza" }, { property: "og:description", content: "Menu growth is coming in the final software. This is a demo." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FuturePage title="Menu Growth" icon={BookOpen} />,
});