import m01 from "@/assets/menu/m01.jpg.asset.json";
import m02 from "@/assets/menu/m02.jpg.asset.json";
import m03 from "@/assets/menu/m03.jpg.asset.json";
import m04 from "@/assets/menu/m04.jpg.asset.json";
import m05 from "@/assets/menu/m05.jpg.asset.json";
import m06 from "@/assets/menu/m06.jpg.asset.json";
import m07 from "@/assets/menu/m07.jpg.asset.json";
import m08 from "@/assets/menu/m08.jpg.asset.json";
import m09 from "@/assets/menu/m09.jpg.asset.json";
import m10 from "@/assets/menu/m10.jpg.asset.json";
import m11 from "@/assets/menu/m11.jpg.asset.json";
import m12 from "@/assets/menu/m12.jpg.asset.json";
import m13 from "@/assets/menu/m13.jpg.asset.json";
import m14 from "@/assets/menu/m14.jpg.asset.json";
import m15 from "@/assets/menu/m15.jpg.asset.json";
import m16 from "@/assets/menu/m16.jpg.asset.json";
import m17 from "@/assets/menu/m17.jpg.asset.json";
import m18 from "@/assets/menu/m18.jpg.asset.json";
import m19 from "@/assets/menu/m19.jpg.asset.json";
import m20 from "@/assets/menu/m20.jpg.asset.json";
import m21 from "@/assets/menu/m21.jpg.asset.json";
import m22 from "@/assets/menu/m22.jpg.asset.json";
import m23 from "@/assets/menu/m23.jpg.asset.json";
import m24 from "@/assets/menu/m24.jpg.asset.json";
import m25 from "@/assets/menu/m25.jpg.asset.json";
import m26 from "@/assets/menu/m26.jpg.asset.json";
import m28 from "@/assets/menu/m28.jpg.asset.json";
import drink500 from "@/assets/menu/drink-500.jpg";
import drinkLarge from "@/assets/menu/drink-large.jpg";
import tinWater from "@/assets/menu/drink-tin-water.jpg";
import sauces from "@/assets/menu/sauces.jpg";
import nuggets from "@/assets/menu/nuggets.jpg";

/** Visual-only map: product id -> image URL. Never affects pricing. */
const byId: Record<string, string> = {
  "deal-1": m18.url, "deal-2": m17.url, "deal-3": m23.url, "deal-4": m22.url, "deal-5": m28.url, "deal-birthday": m21.url,
  "pz-mimis-special": m06.url, "pz-crown-crust": m07.url, "pz-malai-boti": m08.url, "pz-behari-kabab": m10.url,
  "pz-kabab-lover": m10.url, "pz-bbq": m10.url, "pz-chicken-extreme": m08.url, "pz-peri-peri": m04.url,
  "pz-paratha": m26.url, "calzone-chunk": m09.url, "pz-cheese-stuffer": m07.url, "pz-chicken-stuffer": m07.url, "pz-kabab-stuffer": m07.url,
  "bg-onion-smash": m03.url, "bg-jalapeno-smash": m02.url, "bg-grill": m01.url,
  "wg-hot": m11.url, "wg-chipotley": m13.url, "wg-bbq": m13.url, "wg-peri": m11.url, "wg-oven": m19.url,
  "ng-nuggets": nuggets, "ng-arabian": nuggets,
  "fr-pizza": m25.url, "fr-loaded": m25.url,
  "pl-special": m24.url, "pl-malai": m24.url, "sd-cheese-stick": m09.url, "sd-chicken-cheese-stick": m09.url,
  "wr-special": m16.url, "wr-arabian": m16.url, "rl-spin": m14.url, "rl-malai": m14.url, "rl-behari": m14.url,
  "dr-500": drink500, "dr-1l": drinkLarge, "dr-1-5l": drinkLarge, "dr-tin": tinWater, "dr-water-s": tinWater, "dr-water-l": tinWater,
};

const byCategory: Record<string, string> = {
  pizza: m04.url, burgers: m12.url, fries: m05.url, pasta: m20.url, rolls: m14.url, sauces: sauces, fried: m11.url,
};

export const productImages: Record<string, string> = byId;
export const imageFor = (id: string, category: string): string | undefined =>
  byId[id] ?? (id.startsWith("sw-") ? m15.url : undefined) ?? byCategory[category];
