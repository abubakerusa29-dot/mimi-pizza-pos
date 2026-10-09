import { createFileRoute, notFound } from "@tanstack/react-router";
import { FuturePage } from "@/components/pos/FuturePage";
import { futureFeatures } from "@/data/futureFeatures";

export const Route = createFileRoute("/features/$slug")({
  loader: ({ params }) => {
    const feature = futureFeatures.find((f) => f.slug === params.slug);
    if (!feature) throw notFound();
    return { slug: feature.slug, label: feature.label, summary: feature.summary };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — Mimi’s Pizza" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.label} — Mimi’s Pizza POS`;
    return { meta: [{ title }, { name: "description", content: loaderData.summary }, { property: "og:title", content: title }, { property: "og:description", content: loaderData.summary }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
  },
  component: FeaturePage,
});

function FeaturePage() {
  const { slug } = Route.useLoaderData();
  const f = futureFeatures.find((x) => x.slug === slug)!;
  return <FuturePage title={f.label} icon={f.icon} summary={f.summary} actions={f.actions} />;
}
