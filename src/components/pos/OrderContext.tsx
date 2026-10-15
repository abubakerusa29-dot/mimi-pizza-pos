import { createContext, useContext, useState, type ReactNode, type Context } from "react";
import type { CartLine } from "@/lib/cart";
import type { DeliveryStatus } from "@/lib/riders";
import { emptyOverrides, type MenuOverrides } from "@/lib/menuOverrides";
import { restaurantInfo } from "@/data/menuData";
import { riders as defaultRiders, deliveryAreas as defaultAreas } from "@/data/riders";

export type OrderType = "Dine-in" | "Takeaway" | "Delivery";

function useOrderState() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderNo, setOrderNo] = useState(1001);
  const [orderType, setOrderType] = useState<OrderType>("Dine-in");
  const [table, setTable] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [rider, setRider] = useState("");
  const [area, setArea] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  /** Records (or updates) an invoice in this session's history, keyed by order number. */
  const saveInvoice = (inv: Invoice) => setInvoices((list) => {
    const prev = list.find((i) => i.orderNo === inv.orderNo);
    return [{ ...inv, status: prev?.status ?? inv.status }, ...list.filter((i) => i.orderNo !== inv.orderNo)];
  });
  const setInvoiceStatus = (orderNo: number, status: DeliveryStatus) => setInvoices((list) => list.map((i) => (i.orderNo === orderNo ? { ...i, status } : i)));
  const [menuOverrides, setMenuOverrides] = useState<MenuOverrides>(emptyOverrides);
  /** Restaurant profile printed on receipts; editable from Settings (session only). */
  const [restaurant, setRestaurant] = useState(restaurantInfo);
  /** Rider names and delivery areas; the owner manages these from Settings. */
  const [riderList, setRiderList] = useState<string[]>(defaultRiders);
  const [areaList, setAreaList] = useState<string[]>(defaultAreas);
  return { menuOverrides, setMenuOverrides, restaurant, setRestaurant, riderList, setRiderList, areaList, setAreaList, rider, setRider, area, setArea, setInvoiceStatus, lines, setLines, orderNo, setOrderNo, orderType, setOrderType, table, setTable, phone, setPhone, address, setAddress, invoices, saveInvoice };
}

export interface Invoice { orderNo: number; date: Date; lines: CartLine[]; orderType: OrderType; table: string; phone: string; address: string; rider?: string | undefined; area?: string | undefined; status?: DeliveryStatus | undefined }

type OrderValue = ReturnType<typeof useOrderState>;
// Keep one context object across hot reloads so the provider and the pages always match.
const store = globalThis as typeof globalThis & { __mimiOrderContext?: Context<OrderValue | null> };
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