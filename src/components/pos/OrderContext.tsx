import { createContext, useContext, useState, type ReactNode, type Context } from "react";
import type { CartLine } from "@/lib/cart";

export type OrderType = "Dine-in" | "Takeaway" | "Delivery";

function useOrderState() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderNo, setOrderNo] = useState(1001);
  const [orderType, setOrderType] = useState<OrderType>("Dine-in");
  const [table, setTable] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  return { lines, setLines, orderNo, setOrderNo, orderType, setOrderType, table, setTable, phone, setPhone, address, setAddress };
}

type OrderValue = ReturnType<typeof useOrderState>;
// Keep one context object across hot reloads so the provider and the pages always match.
const store = globalThis as typeof globalThis & { __mimiOrderContext?: React.Context<OrderValue | null> };
const OrderContext = (store.__mimiOrderContext ??= createContext<OrderValue | null>(null));
export function OrderProvider({ children }: { children: ReactNode }) {
  const order = useOrderState();
  return <OrderContext.Provider value={order}>{children}</OrderContext.Provider>;
}
export function useOrder() {
  const order = useContext(OrderContext);
  if (!order) throw new Error("OrderProvider is required");
  return order;
}