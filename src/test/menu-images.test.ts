import { describe, expect, it } from "vitest";
import { products } from "@/data/menuData";
import { productImages } from "@/data/productImages";

describe("menu photos", () => {
  it("gives every product a photo", () => {
    expect(products.filter((p) => !productImages[p.id]).map((p) => p.id)).toEqual([]);
  });
  it("never reuses the same photo for two products", () => {
    const shared = new Set(["pl-malai-boti", "dr-water-large"]); // client asked for same photo
    const srcs = products.filter((p) => !shared.has(p.id)).map((p) => productImages[p.id]);
    expect(new Set(srcs).size).toBe(srcs.length);
  });
  it("keeps menu prices from the printed menu", () => {
    const find = (id: string) => products.find((p) => p.id === id)!;
    expect(find("deal-birthday").price).toBe(8470);
    expect(find("deal-5").price).toBe(2580);
    expect(find("pz-behari-kabab").sizes?.map((s) => s.price)).toEqual([1400, 1800, 2600]);
    expect(find("pz-square").sizes?.map((s) => s.price)).toEqual([750, 1350, 1750]);
  });
});
