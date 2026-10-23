export type CategoryId = "deals" | "pizza" | "burgers" | "wings" | "sides" | "pasta" | "rolls" | "drinks" | "extras";

export const categories: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "deals", label: "Deals" },
  { id: "pizza", label: "Pizza" },
  { id: "burgers", label: "Burgers" },
  { id: "wings", label: "Wings & Nuggets" },
  { id: "sides", label: "Fries & Sides" },
  { id: "pasta", label: "Pasta & Platters" },
  { id: "rolls", label: "Rolls, Wraps & Sandwiches" },
  { id: "drinks", label: "Drinks" },
  { id: "extras", label: "Sauces & Extras" },
];

export interface SizeOption { size: string; price: number }

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  tag?: string;
  description?: string;
  price?: number; // fixed-price items
  sizes?: SizeOption[]; // items with size / piece / patty options
  flavourChoice?: boolean; // deals with "any regular flavour" pizza
}

const S = (s: number, m: number, l: number, f: number): SizeOption[] => [
  { size: "Small", price: s }, { size: "Medium", price: m }, { size: "Large", price: l }, { size: "Family", price: f },
];
const SIG: SizeOption[] = [{ size: "Medium", price: 1400 }, { size: "Large", price: 1800 }, { size: "Family", price: 2600 }];
const SPECIAL = S(700, 1300, 1700, 2500);
const REGULAR = S(650, 1200, 1600, 2400);
export const DRINK_FLAVOURS = ["Coke", "Sprite", "Fanta", "Pepsi", "7Up", "Dew"];
const drink = (p: number): SizeOption[] => DRINK_FLAVOURS.map((f) => ({ size: f, price: p }));
const two = (a: string, ap: number, b: string, bp: number): SizeOption[] => [{ size: a, price: ap }, { size: b, price: bp }];

export const products: Product[] = [
  // Deals
  { id: "deal-1", name: "Deal 1", category: "deals", price: 1460, description: "Mimi’s Special Small Pizza, Zinger Burger, Small Fries, 500 ml Drink" },
  { id: "deal-2", name: "Deal 2", category: "deals", price: 1530, flavourChoice: true, description: "Regular Small Pizza, Creamy Pasta (Half), Chicken Paratha Roll, 500 ml Drink" },
  { id: "deal-3", name: "Deal 3", category: "deals", price: 1780, flavourChoice: true, description: "Regular Medium Pizza, 6 Hot Wings, 1 Liter Drink" },
  { id: "deal-4", name: "Deal 4", category: "deals", price: 2480, flavourChoice: true, description: "Regular Large Pizza, Small Pizza, 1.5 Liter Drink" },
  { id: "deal-5", name: "Deal 5", category: "deals", price: 2580, flavourChoice: true, description: "Regular Large Pizza, Pizza Fries (Small), Chicken Petty Burger, 1.5 Liter Drink" },
  { id: "deal-birthday", name: "Birthday Deal", category: "deals", price: 8470, description: "2 Large Special Pizzas, 2 Medium Regular Pizzas, 2 Zinger Burgers, Crunchy Pasta (Full), 10 Hot Wings, 2 × 1.5 Liter Drinks" },

  // Special pizzas
  { id: "pz-mimis-special", name: "Mimi’s Special Pizza", category: "pizza", tag: "Special", sizes: SPECIAL, description: "Special sauce, chicken, onion, capsicum, mushroom, tomato, olives, sausages, sweet corn, cheese" },
  { id: "pz-chicken-extreme", name: "Chicken Extreme Pizza", category: "pizza", tag: "Special", sizes: SPECIAL, description: "Special sauce, 3 types of chicken, onion, capsicum, mushrooms, green olives" },
  { id: "pz-bbq", name: "BBQ Pizza", category: "pizza", tag: "Special", sizes: SPECIAL, description: "Dip sauce, smokey chicken, onion, capsicum, red jalapeno" },
  { id: "pz-malai-boti", name: "Malai Boti Pizza", category: "pizza", tag: "Special", sizes: SPECIAL, description: "Special sauce, malai boti chicken, mushroom, onion, olives, cheese, tomato" },
  { id: "pz-peri-peri", name: "Peri-Peri Pizza", category: "pizza", tag: "Special", sizes: SPECIAL, description: "Peri-peri sauce, chicken, onion, capsicum, cheese" },
  // Signature pizzas
  { id: "pz-behari-kabab", name: "Behari Kabab Pizza", category: "pizza", tag: "Signature", sizes: SIG, description: "Special sauce, onion, chicken, cheese, kabab" },
  { id: "pz-crown-crust", name: "Crown Crust Pizza", category: "pizza", tag: "Signature", sizes: SIG, description: "Special sauce, chicken, onion, capsicum, olives, tomato, cheese" },
  { id: "pz-chicken-stuffer", name: "Chicken Stuffer Pizza", category: "pizza", tag: "Signature", sizes: SIG, description: "Special sauce, chicken, onion, capsicum, olives, tomato, cheese" },
  { id: "pz-kabab-stuffer", name: "Kabab Stuffer Pizza", category: "pizza", tag: "Signature", sizes: SIG, description: "Special sauce, chicken, onion, capsicum, olives, tomato, cheese" },
  { id: "pz-kabab-lover", name: "Kabab Lover Pizza", category: "pizza", tag: "Signature", sizes: SIG, description: "Special sauce, kabab, onion, capsicum, olives, tomato, cheese" },
  { id: "pz-cheese-stuffer", name: "Cheese Stuffer Pizza", category: "pizza", tag: "Signature", sizes: SIG, description: "Special sauce, chicken, onion, capsicum, olives, tomato, sweet corn, cheese" },
  // Regular pizzas
  { id: "pz-chicken-lover", name: "Chicken Lover Pizza", category: "pizza", tag: "Regular", sizes: REGULAR, description: "Tomato sauce, double chicken, onion, capsicum, tomato, cheese" },
  { id: "pz-cheese-lover", name: "Cheese Lover Pizza", category: "pizza", tag: "Regular", sizes: REGULAR, description: "Tomato sauce, mozzarella cheese, black olives" },
  { id: "pz-chicken-tikka", name: "Chicken Tikka Pizza", category: "pizza", tag: "Regular", sizes: REGULAR, description: "Tomato sauce, chicken, onion, capsicum, tomato, olives, cheese" },
  { id: "pz-creamy-tikka", name: "Creamy Chicken Tikka Pizza", category: "pizza", tag: "Regular", sizes: REGULAR, description: "Tomato sauce, special cream, chicken, onion, capsicum, tomato, sweet corn, cheese" },
  { id: "pz-fajita", name: "Fajita Pizza", category: "pizza", tag: "Regular", sizes: REGULAR, description: "Tomato sauce, chicken, onion, sausages, capsicum, cheese" },
  { id: "pz-chicken-supreme", name: "Chicken Supreme Pizza", category: "pizza", tag: "Regular", sizes: REGULAR, description: "Tomato sauce, chicken, onion, mushroom, olives, cheese" },
  { id: "pz-vegetable", name: "Vegetable Pizza", category: "pizza", tag: "Regular", sizes: REGULAR, description: "Tomato sauce, onion, jalapeno, capsicum, mushroom, tomato, olives, sweet corn, cheese" },
  { id: "pz-hot-spicy", name: "Hot & Spicy Pizza", category: "pizza", tag: "Regular", sizes: REGULAR, description: "Tomato sauce, jalapeno, chicken, onion, capsicum, cheese" },
  { id: "pz-square", name: "Square Pizza", category: "pizza", tag: "Square", sizes: [{ size: "Small", price: 750 }, { size: "Medium", price: 1350 }, { size: "Large", price: 1750 }], description: "Special sauce, chicken, 2 type sausages, onion, capsicum, red jalapeno, mushroom" },

  // Burgers
  { id: "bg-mighty-zinger", name: "Mighty Zinger Burger", category: "burgers", price: 650 },
  { id: "bg-tender-fillet", name: "Tender Fillet Burger", category: "burgers", price: 400 },
  { id: "bg-arabian-fillet", name: "Arabian Fillet Burger", category: "burgers", price: 350 },
  { id: "bg-zinger", name: "Zinger Burger", category: "burgers", price: 380 },
  { id: "bg-zinger-cheese", name: "Zinger Cheese Burger", category: "burgers", price: 480 },
  { id: "bg-petty", name: "Chicken Petty Burger", category: "burgers", price: 300 },
  { id: "bg-petty-cheese", name: "Chicken Petty Cheese Burger", category: "burgers", price: 350 },
  { id: "bg-onion-smash", name: "Onion Smash Beef Burger", category: "burgers", tag: "Signature", sizes: two("Single Patty", 650, "Double Patty", 850), description: "Beef smash patties, cheese, caramelised onions, lettuce, special sauce" },
  { id: "bg-jalapeno-smash", name: "Jalapeno Smash Beef Burger", category: "burgers", tag: "Signature", sizes: two("Single Patty", 650, "Double Patty", 850), description: "Beef smash patties, cheese, jalapenos, lettuce, special sauce" },
  { id: "bg-grill", name: "Chicken Grill Burger", category: "burgers", tag: "Signature", sizes: two("Single Patty", 600, "Double Patty", 800), description: "Grilled chicken fillet, lettuce, BBQ and special sauce" },

  // Wings & nuggets
  { id: "wg-hot", name: "Hot Wings", category: "wings", sizes: two("6 Pcs", 400, "10 Pcs", 650) },
  { id: "wg-oven", name: "Oven Baked Wings", category: "wings", sizes: two("6 Pcs", 400, "12 Pcs", 800) },
  { id: "wg-peri", name: "Peri Peri Wings", category: "wings", sizes: two("6 Pcs", 430, "12 Pcs", 860) },
  { id: "wg-bbq", name: "Bar B Q Wings", category: "wings", sizes: two("6 Pcs", 430, "12 Pcs", 860) },
  { id: "wg-chipotley", name: "Chipotley Saucy Wings", category: "wings", sizes: two("5 Pcs", 400, "10 Pcs", 800) },
  { id: "wg-nuggets", name: "Nuggets", category: "wings", sizes: two("6 Pcs", 300, "10 Pcs", 550) },
  { id: "wg-arabian-nuggets", name: "Arabian Fillet Nuggets", category: "wings", sizes: two("5 Pcs", 400, "10 Pcs", 800) },

  // Fries & sides
  { id: "sd-fries", name: "Fries", category: "sides", sizes: two("Small", 250, "Large", 350) },
  { id: "sd-mayo-fries", name: "Mayo Fries", category: "sides", sizes: two("Small", 300, "Large", 400) },
  { id: "sd-chipotley-fries", name: "Chipotley Fries", category: "sides", sizes: two("Small", 300, "Large", 400) },
  { id: "sd-pizza-fries", name: "Pizza Fries", category: "sides", tag: "Special", sizes: two("Small", 450, "Large", 750) },
  { id: "sd-loaded-fries", name: "Loaded Fries", category: "sides", tag: "Special", sizes: two("Small", 500, "Large", 800) },
  { id: "sd-cheese-stick", name: "Cheese Stick", category: "sides", price: 650 },
  { id: "sd-chicken-cheese-stick", name: "Chicken Cheese Stick", category: "sides", price: 1000 },
  { id: "sd-calzon-chunk", name: "Calzon Chunk", category: "sides", price: 1300 },

  // Pasta & platters
  { id: "ps-cheesy", name: "Cheesy Pasta", category: "pasta", tag: "Oven Baked", sizes: two("Half", 500, "Full", 800) },
  { id: "ps-creamy", name: "Creamy Pasta", category: "pasta", tag: "Oven Baked", sizes: two("Half", 450, "Full", 750) },
  { id: "ps-crunchy", name: "Crunchy Pasta", category: "pasta", tag: "Oven Baked", sizes: two("Half", 500, "Full", 800) },
  { id: "pl-special", name: "Special Platter", category: "pasta", price: 1150, description: "Oven Baked Wings (6 Pcs), Spin Roll (4 Pcs), Regular Fries, Dip Sauce" },
  { id: "pl-malai-boti", name: "Malai Boti Platter", category: "pasta", price: 1150, description: "Oven Baked Wings (6 Pcs), Malai Boti Roll (4 Pcs), Regular Fries, Dip Sauce" },

  // Rolls, wraps & sandwiches
  { id: "rl-chicken-paratha", name: "Chicken Paratha Roll", category: "rolls", price: 300 },
  { id: "rl-chicken-cheese-paratha", name: "Chicken Cheese Paratha Roll", category: "rolls", price: 350 },
  { id: "rl-malai-boti-paratha", name: "Malai Boti Paratha Roll", category: "rolls", price: 300 },
  { id: "rl-zinger-paratha", name: "Zinger Paratha Roll", category: "rolls", price: 380 },
  { id: "rl-pizza-paratha", name: "Pizza Paratha", category: "rolls", price: 450 },
  { id: "rl-spin", name: "Spin Roll", category: "rolls", tag: "4 Pcs", price: 500 },
  { id: "rl-malai-boti", name: "Malai Boti Roll", category: "rolls", tag: "4 Pcs", price: 500 },
  { id: "rl-behari-kabab", name: "Behari Kabab Roll", category: "rolls", price: 600 },
  { id: "wr-special", name: "Mimi’s Special Wrap", category: "rolls", tag: "Wrap", price: 500 },
  { id: "wr-arabian-grill", name: "Arabian Grill Wrap", category: "rolls", tag: "Wrap", price: 550 },
  { id: "sw-tikka", name: "Tikka Sandwich", category: "rolls", tag: "Sandwich", price: 350 },
  { id: "sw-mexican", name: "Mexican Sandwich", category: "rolls", tag: "Sandwich", price: 750 },
  { id: "sw-grill", name: "Grill Sandwich", category: "rolls", tag: "Sandwich", price: 400 },

  // Drinks
  { id: "dr-500", name: "Soft Drink", category: "drinks", tag: "500 ml", sizes: drink(130) },
  { id: "dr-tin", name: "Soft Drink", category: "drinks", tag: "Tin Pack", sizes: drink(120) },
  { id: "dr-1l", name: "Soft Drink", category: "drinks", tag: "1 Liter", sizes: drink(180) },
  { id: "dr-1-5l", name: "Soft Drink", category: "drinks", tag: "1.5 Liter", sizes: drink(230) },
  { id: "dr-water-small", name: "Water", category: "drinks", tag: "Small", price: 70 },
  { id: "dr-water-large", name: "Water", category: "drinks", tag: "Large", price: 120 },

  // Sauces & extras
  { id: "ex-sauces", name: "Sauces", category: "extras", sizes: [{ size: "Special Sauce", price: 100 }, { size: "Dip Sauce", price: 100 }, { size: "Burger Sauce", price: 100 }, { size: "Chipotley Sauce", price: 100 }, { size: "Peri Peri Sauce", price: 150 }] },
  { id: "ex-topping", name: "Extra Topping", category: "extras", tag: "Pizza", sizes: S(100, 150, 200, 300) },
  { id: "ex-cheese-slice", name: "Cheese Slice", category: "extras", price: 100 },
];

/** Regular-flavour pizzas a customer can pick inside a deal. */
export const regularFlavours = products.filter((p) => p.tag === "Regular").map((p) => p.name.replace(/ Pizza$/, ""));

export const restaurantInfo = {
  address: "Main Qasba Road, Near Muhammadi Masjid, Gali Alma Wali, Lalamusa",
  phone: "0312-4607733",
  hours: "1:00 PM – 1:00 AM",
  delivery: "Free home delivery under 3 km · Minimum order Rs. 1,000",
};
