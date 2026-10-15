import { createContext, useContext, useEffect, useState, type ReactNode, type Context } from "react";
import type { CartLine } from "@/lib/cart";
import type { DeliveryStatus } from "@/lib/riders";
import { emptyOverrides, type MenuOverrides } from "@/lib/menuOverrides";
import { restaurantInfo } from "@/data/menuData";
import { riders as defaultRiders, deliveryAreas as defaultAreas } from "@/data/riders";
import { loadInvoices, loadSettings, persistInvoice, persistInvoiceStatus, persistSettings } from "@/lib/persistence";

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
  const [menuOverrides, setMenuOverridesState] = useState<MenuOverrides>(emptyOverrides);
  /** Restaurant profile printed on receipts; editable from Settings. */
  const [restaurant, setRestaurantState] = useState(restaurantInfo);
  /** Rider names and delivery areas; the owner manages these from Settings. */
  const [riderList, setRiderListState] = useState<string[]>(defaultRiders);
  const [areaList, setAreaListState] = useState<string[]>(defaultAreas);

  // Load permanently saved data once on startup.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [savedInvoices, saved] = await Promise.all([loadInvoices(), loadSettings()]);
      if (cancelled) return;
      if (savedInvoices.length) {
        setInvoices(savedInvoices);
        setOrderNo((n) => Math.max(n, Math.max(...savedInvoices.map((i) => i.orderNo)) + 1));
      }
      if (saved) {
        setRestaurantState(saved.restaurant);
        setRiderListState(saved.riders);
        setAreaListState(saved.areas);
        setMenuOverridesState(saved.menuOverrides);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveSettings = (next: { restaurant: typeof restaurantInfo; riders: string[]; areas: string[]; menuOverrides: MenuOverrides }) =>
    void persistSettings(next);

  /** Records (or updates) an invoice in history, keyed by order number, and saves it permanently. */
  const saveInvoice = (inv: Invoice) => {
    setInvoices((list) => {
      const prev = list.find((i) => i.orderNo === inv.orderNo);
      return [{ ...inv, status: prev?.status ?? inv.status }, ...list.filter((i) => i.orderNo !== inv.orderNo)];
    });
    void persistInvoice(inv);
  };
  const setInvoiceStatus = (orderNo: number, status: DeliveryStatus) => {
    setInvoices((list) => list.map((i) => (i.orderNo === orderNo ? { ...i, status } : i)));
    void persistInvoiceStatus(orderNo, status);
  };
  const setMenuOverrides = (next: MenuOverrides) => {
    setMenuOverridesState(next);
    saveSettings({ restaurant, riders: riderList, areas: areaList, menuOverrides: next });
  };
  const setRestaurant = (next: typeof restaurantInfo) => {
    setRestaurantState(next);
    saveSettings({ restaurant: next, riders: riderList, areas: areaList, menuOverrides });
  };
  const setRiderList = (next: string[]) => {
    setRiderListState(next);
    saveSettings({ restaurant, riders: next, areas: areaList, menuOverrides });
  };
  const setAreaList = (next: string[]) => {
    setAreaListState(next);
    saveSettings({ restaurant, riders: riderList, areas: next, menuOverrides });
  };

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
