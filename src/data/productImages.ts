// Product photos keyed by product id (file name without extension).
// Kept separate from menu/pricing data so visual changes never affect billing.
const local = import.meta.glob<string>("../assets/*.jpg", { eager: true, import: "default" });
const hosted = import.meta.glob<{ url: string }>("../assets/*.jpg.asset.json", { eager: true, import: "default" });

const stem = (path: string) => path.split("/").pop()!.replace(/\.jpg(\.asset\.json)?$/, "");

export const productImages: Record<string, string> = {};
for (const [path, src] of Object.entries(local)) productImages[stem(path)] = src;
for (const [path, asset] of Object.entries(hosted)) productImages[stem(path)] = asset.url;
