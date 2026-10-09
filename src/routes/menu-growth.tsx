import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { FuturePage } from "@/components/pos/FuturePage";
export const Route = createFileRoute("/menu-growth")({
  head: () => ({ meta: [{ title: "Menu Management — Mimi’s Pizza" }, { name: "description", content: "Add products, deals and categories in Mimi’s Pizza’s final POS software." }, { property: "og:title", content: "Menu Management — Mimi’s Pizza" }, { property: "og:description", content: "Add products, deals, categories and prices. Coming in the final software." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <FuturePage title="Menu Management" icon={BookOpen} summary="Grow your menu: add new items, deals and categories, and update prices anytime." actions={["Add product", "Add deal", "Add category", "Edit prices & sizes", "Upload item photos", "Best-selling items"]} />,
});
