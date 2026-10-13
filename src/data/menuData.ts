export type CategoryId =
  | "deals" | "pizza" | "burgers" | "fried" | "fries" | "pasta" | "rolls" | "platters" | "drinks" | "sauces";

export const categories: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "deals", label: "Deals" },
  { id: "pizza", label: "Pizza" },
  { id: "burgers", label: "Burgers" },
  { id: "fried", label: "Wings & Nuggets" },
  { id: "fries", label: "Fries" },
  { id: "pasta", label: "Pasta" },
  { id: "rolls", label: "Rolls & Wraps" },
  { id: "platters", label: "Platters & Sides" },
  { id: "drinks", label: "Drinks" },
  { id: "sauces", label: "Sauces & Extras" },
];

export interface SizeOption { size: string; price: number }

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  tag?: string;
  description?: string;
  price?: number; // fixed-price items
  sizes?: SizeOption[]; // size/variant-based items
  flavourChoice?: "regular" | "special"; // deals with "any flavour" pizza
  extras?: "pizza" | "smash" | "general"; // which add-on list applies
}

export interface Extra { id: string; label: string; price: number }

/** Add-ons offered in the item dialog. Pizza topping is priced per size. */
export const sauceExtras: Extra[] = [
  { id: "special-sauce", label: "Special Sauce", price: 100 },
  { id: "dip-sauce", label: "Dip Sauce", price: 100 },
  { id: "burger-sauce", label: "Burger Sauce", price: 100 },
  { id: "peri-sauce", label: "Peri Peri Sauce", price: 150 },
  { id: "chipotley-sauce", label: "Chipotley Sauce", price: 100 },
  { id: "cheese-slice", label: "Cheese Slice", price: 100 },
];
export const extraPatty: Extra = { id: "extra-patty", label: "Extra Patty", price: 200 };
export const extraToppingBySize: Record<string, number> = { Small: 100, Medium: 150, Large: 200, Family: 300 };

const REG = [650, 1200, 1600, 2400];
const SPE = [700, 1300, 1700, 2500];
const SIG = [1400, 1800, 2600];
const sizes4 = (p: number[]): SizeOption[] =>
  ["Small", "Medium", "Large", "Family"].map((size, i) => ({ size, price: p[i]! }));
const sizes3 = (p: number[]): SizeOption[] =>
  ["Medium", "Large", "Family"].map((size, i) => ({ size, price: p[i]! }));
const sl = (a: string, ap: number, b: string, bp: number): SizeOption[] => [{ size: a, price: ap }, { size: b, price: bp }];

const pz = (id: string, name: string, tag: string, description: string, s: SizeOption[]): Product =>
  ({ id, name, category: "pizza", tag, description, sizes: s, extras: "pizza" });

export const regularPizzas: Product[] = [
  pz("pz-chicken-lover", "Chicken Lover Pizza", "Regular", "Tomato Sauce, Double Chicken, Onion, Capsicum, Tomato, Cheese", sizes4(REG)),
  pz("pz-cheese-lover", "Cheese Lover Pizza", "Regular", "Tomato Sauce, Cheese, Mozzarella Cheese, Black Olives", sizes4(REG)),
  pz("pz-chicken-tikka", "Chicken Tikka Pizza", "Regular", "Tomato Sauce, Chicken, Onion, Capsicum, Tomato, Olives, Cheese", sizes4(REG)),
  pz("pz-creamy-tikka", "Creamy Chicken Tikka Pizza", "Regular", "Tomato Sauce, Special Cream, Chicken, Onion, Capsicum, Tomato, Sweet Corn, Cheese", sizes4(REG)),
  pz("pz-fajita", "Fajita Pizza", "Regular", "Tomato Sauce, Chicken, Onion, Sausages, Capsicum, Cheese", sizes4(REG)),
  pz("pz-supreme", "Chicken Supreme Pizza", "Regular", "Tomato Sauce, Chicken, Onion, Mushroom, Olives, Cheese", sizes4(REG)),
  pz("pz-vegetable", "Vegetable Pizza", "Regular", "Tomato Sauce, Onion, Jalapeno, Capsicum, Mushroom, Tomato, Olives, Sweet Corn, Cheese", sizes4(REG)),
  pz("pz-hot-spicy", "Hot & Spicy Pizza", "Regular", "Tomato Sauce, Jalapeno, Chicken, Onion, Capsicum, Cheese", sizes4(REG)),
];
export const specialPizzas: Product[] = [
  pz("pz-mimis-special", "Mimi’s Special Pizza", "Special", "S. Sauce, Chicken, Onion, Capsicum, Mushroom, Tomato, Olives, Sausages, Sweet Corn, Cheese", sizes4(SPE)),
  pz("pz-chicken-extreme", "Chicken Extreme Pizza", "Special", "S. Sauce, Chicken, Onion, Capsicum, Mushrooms, Green Olives, 3 Type Chicken", sizes4(SPE)),
  pz("pz-bbq", "BBQ Pizza", "Special", "Dip Sauce, Smokey Chicken, Onion, Capsicum, Red Jalapeno", sizes4(SPE)),
  pz("pz-malai-boti", "Malai Boti Pizza", "Special", "S. Sauce, Malai Boti Chicken, Mushroom, Onion, Olives, Cheese, Tomato", sizes4(SPE)),
  pz("pz-peri-peri", "Peri-Peri Pizza", "Special", "Peri-Peri Sauce, Chicken, Onion, Capsicum, Cheese", sizes4(SPE)),
];

export const regularFlavours = regularPizzas.map((p) => p.name.replace(/ Pizza$/, ""));
export const specialFlavours = specialPizzas.map((p) => p.name.replace(/ Pizza$/, ""));

const f = (id: string, name: string, category: CategoryId, price: number, extra: Partial<Product> = {}): Product =>
  ({ id, name, category, price, extras: "general", ...extra });

export const products: Product[] = [
  // Deals
  { id: "deal-1", name: "Deal 1", category: "deals", price: 1460, description: "Mimi’s Special Pizza (Small), Zinger Burger, Small Fries, 500 ml Drink" },
  { id: "deal-2", name: "Deal 2", category: "deals", price: 1530, flavourChoice: "regular", description: "Regular Small Pizza, Creamy Pasta (Half), Chicken Paratha Roll, 500 ml Drink" },
  { id: "deal-3", name: "Deal 3", category: "deals", price: 1780, flavourChoice: "regular", description: "Regular Medium Pizza, 6 Hot Wings, 1 Liter Drink" },
  { id: "deal-4", name: "Deal 4", category: "deals", price: 2480, flavourChoice: "regular", description: "Regular Large Pizza, Small Pizza, 1.5 Liter Drink" },
  { id: "deal-5", name: "Deal 5", category: "deals", price: 2580, flavourChoice: "regular", description: "Regular Large Pizza, Pizza Fries (Small), Chicken Petty Burger, 1.5 Liter Drink" },
  { id: "deal-birthday", name: "Birthday Deal", category: "deals", price: 8470, flavourChoice: "special", description: "2 Special Large Pizza, 2 Regular Medium Pizza, 2 Zinger Burger, Crunchy Pasta (Full), 10 Hot Wings, 2 × 1.5 Liter Drink" },

  // Pizza
  ...specialPizzas,
  ...regularPizzas,
  pz("pz-behari-kabab", "Behari Kabab Pizza", "Signature", "S. Sauce, Onion, Chicken, Cheese, Kabab", sizes3(SIG)),
  pz("pz-crown-crust", "Crown Crust Pizza", "Signature", "S. Sauce, Chicken, Onion, Capsicum, Olives, Tomato, Cheese", sizes3(SIG)),
  pz("pz-chicken-stuffer", "Chicken Stuffer Pizza", "Signature", "S. Sauce, Chicken, Onion, Capsicum, Olives, Tomato, Cheese", sizes3(SIG)),
  pz("pz-kabab-stuffer", "Kabab Stuffer Pizza", "Signature", "S. Sauce, Chicken, Onion, Capsicum, Olives, Tomato, Cheese", sizes3(SIG)),
  pz("pz-kabab-lover", "Kabab Lover Pizza", "Signature", "S. Sauce, Kabab, Onion, Capsicum, Olives, Tomato, Cheese", sizes3(SIG)),
  pz("pz-cheese-stuffer", "Cheese Stuffer Pizza", "Signature", "S. Sauce, Chicken, Onion, Capsicum, Olives, Tomato, Sweet Corn, Cheese", sizes3(SIG)),
  pz("pz-square", "Square Pizza", "Square", "Chicken, Onion, Capsicum, Sausages, 2 Type Special Sauce, Red Jalapeno, Mushroom",
    [{ size: "Small", price: 750 }, { size: "Medium", price: 1350 }, { size: "Large", price: 1750 }]),
  f("pz-paratha", "Pizza Paratha", "pizza", 450),
  f("calzone-chunk", "Calzone Chunk", "pizza", 1300),

  // Burgers
  f("bg-mighty-zinger", "Mighty Zinger Burger", "burgers", 650),
  f("bg-tender-fillet", "Tender Fillet Burger", "burgers", 400),
  f("bg-arabian-fillet", "Arabian Fillet Burger", "burgers", 350),
  f("bg-zinger", "Zinger Burger", "burgers", 380),
  f("bg-zinger-cheese", "Zinger Cheese Burger", "burgers", 480),
  f("bg-petty", "Chicken Petty Burger", "burgers", 300),
  f("bg-petty-cheese", "Chicken Petty Cheese Burger", "burgers", 350),
  { id: "bg-onion-smash", name: "Onion Smash Beef Burger", category: "burgers", tag: "Mimi’s Signature", extras: "smash",
    description: "Beef smash patties with cheese, caramelised onions, lettuce and special sauce", sizes: sl("Single Patty", 650, "Double Patty", 850) },
  { id: "bg-jalapeno-smash", name: "Jalapeno Smash Beef Burger", category: "burgers", tag: "Mimi’s Signature", extras: "smash",
    description: "Beef smash patties with cheese, jalapenos, lettuce and special sauce", sizes: sl("Single Patty", 650, "Double Patty", 850) },
  { id: "bg-grill", name: "Chicken Grill Burger", category: "burgers", tag: "Mimi’s Signature", extras: "smash",
    description: "Grilled chicken fillet, lettuce, BBQ and special sauce", sizes: sl("Single Patty", 600, "Double Patty", 800) },

  // Wings & nuggets
  { id: "wg-hot", name: "Hot Wings", category: "fried", extras: "general", sizes: sl("6 Pcs", 400, "10 Pcs", 650) },
  { id: "wg-peri", name: "Peri Peri Wings", category: "fried", tag: "Oven Baked", extras: "general", sizes: sl("6 Pcs", 430, "12 Pcs", 860) },
  { id: "wg-oven", name: "Oven Baked Wings", category: "fried", tag: "Oven Baked", extras: "general", sizes: sl("6 Pcs", 400, "12 Pcs", 800) },
  { id: "wg-bbq", name: "Bar B Q Wings", category: "fried", tag: "Oven Baked", extras: "general", sizes: sl("6 Pcs", 430, "12 Pcs", 860) },
  { id: "wg-chipotley", name: "Chipotley Saucy Wings", category: "fried", extras: "general", sizes: sl("5 Pcs", 400, "10 Pcs", 800) },
  { id: "ng-nuggets", name: "Nuggets", category: "fried", extras: "general", sizes: sl("6 Pcs", 300, "10 Pcs", 550) },
  { id: "ng-arabian", name: "Arabian Fillet Nuggets", category: "fried", extras: "general", sizes: sl("5 Pcs", 400, "10 Pcs", 800) },

  // Fries
  { id: "fr-plain", name: "Fries", category: "fries", extras: "general", sizes: sl("Small", 250, "Large", 350) },
  { id: "fr-mayo", name: "Mayo Fries", category: "fries", extras: "general", sizes: sl("Small", 300, "Large", 400) },
  { id: "fr-chipotley", name: "Chipotley Fries", category: "fries", extras: "general", sizes: sl("Small", 300, "Large", 400) },
  { id: "fr-pizza", name: "Pizza Fries", category: "fries", tag: "Special Fries", extras: "general", sizes: sl("Small", 450, "Large", 750) },
  { id: "fr-loaded", name: "Loaded Fries", category: "fries", tag: "Special Fries", extras: "general", sizes: sl("Small", 500, "Large", 800) },

  // Pasta
  f("ps-cheesy", "Cheesy Pasta", "pasta", 500, { tag: "Oven Baked" }),
  f("ps-creamy", "Creamy Pasta", "pasta", 450, { tag: "Oven Baked" }),
  f("ps-crunchy", "Crunchy Pasta", "pasta", 500, { tag: "Oven Baked" }),

  // Rolls, wraps, sandwiches
  f("rl-chicken-paratha", "Chicken Paratha Roll", "rolls", 300),
  f("rl-chicken-cheese-paratha", "Chicken Cheese Paratha Roll", "rolls", 350),
  f("rl-malai-paratha", "Malai Boti Paratha Roll", "rolls", 300),
  f("rl-zinger-paratha", "Zinger Paratha Roll", "rolls", 380),
  f("rl-spin", "Spin Roll", "rolls", 500),
  f("rl-malai", "Malai Boti Roll", "rolls", 500),
  f("rl-behari", "Behari Kabab Roll", "rolls", 600),
  f("wr-special", "Mimi’s Special Wrap", "rolls", 500),
  f("wr-arabian", "Arabian Grill Wrap", "rolls", 550),
  f("sw-tikka", "Tikka Sandwich", "rolls", 350),
  f("sw-mexican", "Mexican Sandwich", "rolls", 750),
  f("sw-grill", "Grill Sandwich", "rolls", 400),

  // Platters & sides
  f("pl-special", "Special Platter", "platters", 1150, { description: "Oven Baked Wings (6 Pcs), Spin Roll (4 Pcs), 1 Regular Fries, 1 Dip Sauce" }),
  f("pl-malai", "Malai Boti Platter", "platters", 1150, { description: "Oven Baked Wings (6 Pcs), Malai Boti Roll (4 Pcs), 1 Regular Fries, 1 Dip Sauce" }),
  f("sd-cheese-stick", "Cheese Stick", "platters", 650),
  f("sd-chicken-cheese-stick", "Chicken Cheese Stick", "platters", 1000),

  // Drinks
  { id: "dr-500", name: "Soft Drink", category: "drinks", tag: "500 ml", price: 130 },
  { id: "dr-tin", name: "Soft Drink", category: "drinks", tag: "Tin Pack", price: 120 },
  { id: "dr-1l", name: "Soft Drink", category: "drinks", tag: "1 Liter", price: 180 },
  { id: "dr-1-5l", name: "Soft Drink", category: "drinks", tag: "1.5 Liter", price: 230 },
  { id: "dr-water-s", name: "Water", category: "drinks", tag: "Small", price: 70 },
  { id: "dr-water-l", name: "Water", category: "drinks", tag: "Large", price: 120 },

  // Sauces & extras (sold separately)
  ...sauceExtras.map((e): Product => ({ id: `sx-${e.id}`, name: e.label, category: "sauces", price: e.price })),
];
