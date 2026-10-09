export type CategoryId = "deals" | "pizza" | "burgers" | "drinks";

export const categories: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "deals", label: "Deals" },
  { id: "pizza", label: "Pizza" },
  { id: "burgers", label: "Burgers" },
  { id: "drinks", label: "Drinks" },
];

export type PizzaSize = "Small" | "Medium" | "Large" | "Family";

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  tag?: string;
  description?: string;
  price?: number; // fixed-price items
  sizes?: { size: PizzaSize; price: number }[]; // size-based items
  flavourChoice?: boolean; // deals with "any regular flavour" pizza
}

/** Regular-flavour pizzas a customer can pick inside a deal. */
export const regularFlavours = ["Chicken Lover", "Chicken Tikka", "Fajita", "BBQ Chicken"];

export const products: Product[] = [
  { id: "deal-1", name: "Deal 1", category: "deals", price: 1460, description: "Mimi’s Special Small Pizza, Zinger Burger, Small Fries, 500 ml Drink" },
  { id: "deal-2", name: "Deal 2", category: "deals", price: 1530, flavourChoice: true, description: "Regular Small Pizza, Creamy Pasta (Half), Chicken Paratha Roll, 500 ml Drink" },
  { id: "deal-3", name: "Deal 3", category: "deals", price: 1780, flavourChoice: true, description: "Regular Medium Pizza, 6 Hot Wings, 1 Liter Drink" },
  { id: "deal-4", name: "Deal 4", category: "deals", price: 2480, flavourChoice: true, description: "Regular Large Pizza, Small Pizza, 1.5 Liter Drink" },
  {
    id: "pz-chicken-lover", name: "Chicken Lover Pizza", category: "pizza", tag: "Regular",
    sizes: [{ size: "Small", price: 650 }, { size: "Medium", price: 1200 }, { size: "Large", price: 1600 }, { size: "Family", price: 2400 }],
  },
  {
    id: "pz-mimis-special", name: "Mimi’s Special Pizza", category: "pizza", tag: "Special",
    sizes: [{ size: "Small", price: 700 }, { size: "Medium", price: 1300 }, { size: "Large", price: 1700 }, { size: "Family", price: 2500 }],
  },
  {
    id: "pz-behari-kabab", name: "Behari Kabab Pizza", category: "pizza", tag: "Signature",
    sizes: [{ size: "Medium", price: 1400 }, { size: "Large", price: 1800 }, { size: "Family", price: 2600 }],
  },
  { id: "bg-mighty-zinger", name: "Mighty Zinger Burger", category: "burgers", price: 650 },
  { id: "bg-tender-fillet", name: "Tender Fillet Burger", category: "burgers", price: 400 },
  { id: "bg-zinger", name: "Zinger Burger", category: "burgers", price: 380 },
  { id: "dr-coke-500", name: "Coke", category: "drinks", tag: "500 ml", price: 130 },
  { id: "dr-sprite-500", name: "Sprite", category: "drinks", tag: "500 ml", price: 130 },
  { id: "dr-coke-1l", name: "Coke", category: "drinks", tag: "1 Liter", price: 180 },
];
