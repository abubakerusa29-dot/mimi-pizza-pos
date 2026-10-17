import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ReviewsPageContent } from "@/components/public/ReviewsSection";

const URL = "https://mimispizza.site/reviews";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews — Mimi’s Pizza Lalamusa" },
      { name: "description", content: "Read real customer reviews of Mimi’s Pizza in Lalamusa and share your own. Verified badges for orders with an invoice number." },
      { property: "og:title", content: "Customer Reviews — Mimi’s Pizza Lalamusa" },
      { property: "og:description", content: "See what customers say about our pizzas, burgers and deals." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: () => (
    <div className="h-dvh overflow-y-auto bg-background">
      <PublicHeader />
      <ReviewsPageContent />
      <PublicFooter />
    </div>
  ),
});
