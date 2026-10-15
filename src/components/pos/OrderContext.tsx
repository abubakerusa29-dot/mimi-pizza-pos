import { createContext, useContext, useEffect, useState, type ReactNode, type Context } from "react";
import type { CartLine } from "@/lib/cart";
import type { DeliveryStatus } from "@/lib/riders";
import { emptyOverrides, type MenuOverrides } from "@/lib/menuOverrides";
import { restaurantInfo } from "@/data/menuData";
import { riders as defaultRiders, deliveryAreas as defaultAreas } from "@/data/riders";
import { loadInvoices, loadSettings, persistInvoice, persistInvoiceStatus, persistRiderAssignment, persistSettings } from "@/lib/persistence";
import { defaultInvoiceSettings, type InvoiceSettings } from "@/lib/invoiceTemplates";
import { emptyBackOffice, findCustomer, upsertCustomer, type BackOffice } from "@/lib/backOffice";
import { defaultTables, type DiningTable } from "@/lib/tables";

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
  const [invoiceSettings, setInvoiceSettingsState] = useState<InvoiceSettings>(defaultInvoiceSettings);
  const [tableList, setTableListState] = useState<DiningTable[]>(defaultTables);
  const [backOffice, setBackOfficeState] = useState<BackOffice>(emptyBackOffice);

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
        setRestaurantState({ ...restaurantInfo, ...saved.restaurant });
        setRiderListState(saved.riders);
        setAreaListState(saved.areas);
        setMenuOverridesState(saved.menuOverrides);
        setInvoiceSettingsState(saved.invoice);
        setTableListState(saved.tables);
        setBackOfficeState(saved.backOffice);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveSettings = (patch: Partial<{ restaurant: typeof restaurantInfo; riders: string[]; areas: string[]; menuOverrides: MenuOverrides; invoice: InvoiceSettings; tables: DiningTable[]; backOffice: BackOffice }>) =>
    void persistSettings({ restaurant, riders: riderList, areas: areaList, menuOverrides, invoice: invoiceSettings, tables: tableList, backOffice, ...patch });

  /** Customers, packing stock, expenses and team; saved with settings. */
  const updateBackOffice = (patch: Partial<BackOffice>) => {
    setBackOfficeState((prev) => {
      const v = { ...prev, ...patch };
      saveSettings({ backOffice: v });
      return v;
    });
  };

  /** Records (or updates) an invoice in history, keyed by order number, and saves it permanently. */
  const saveInvoice = (inv: Invoice) => {
    setInvoices((list) => {
      const prev = list.find((i) => i.orderNo === inv.orderNo);
      return [{ ...inv, status: prev?.status ?? inv.status }, ...list.filter((i) => i.orderNo !== inv.orderNo)];
    });
    void persistInvoice(inv);
    // Remember delivery customers so their address fills in next time.
    if (inv.orderType === "Delivery" && inv.phone.replace(/\D/g, "").length >= 7) {
      const known = findCustomer(backOffice.customers, inv.phone);
      if (!known || (inv.address && known.address !== inv.address)) {
        updateBackOffice({ customers: upsertCustomer(backOffice.customers, { name: known?.name ?? "", notes: known?.notes ?? "", phone: inv.phone, address: inv.address || known?.address || "" }) });
      }
    }
  };
  const setInvoiceStatus = (orderNo: number, status: DeliveryStatus) => {
    setInvoices((list) => list.map((i) => (i.orderNo === orderNo ? { ...i, status } : i)));
    void persistInvoiceStatus(orderNo, status);
  };
  /** Bulk dispatch: hands many delivery invoices to one rider. */
  const assignRider = (orderNos: number[], riderName: string) => {
    const set = new Set(orderNos);
    setInvoices((list) => list.map((i) => (set.has(i.orderNo) ? { ...i, rider: riderName, status: "On the way" as DeliveryStatus } : i)));
    void persistRiderAssignment(orderNos, riderName);
  };
  type Updater<T> = T | ((prev: T) => T);
  const resolve = <T,>(next: Updater<T>, prev: T): T => (typeof next === "function" ? (next as (p: T) => T)(prev) : next);
  const setMenuOverrides = (next: Updater<MenuOverrides>) => {
    const v = resolve(next, menuOverrides);
    setMenuOverridesState(v);
    saveSettings({ menuOverrides: v });
  };
  const setRestaurant = (next: Updater<typeof restaurantInfo>) => {
    const v = resolve(next, restaurant);
    setRestaurantState(v);
    saveSettings({ restaurant: v });
  };
  const setRiderList = (next: Updater<string[]>) => {
    const v = resolve(next, riderList);
    setRiderListState(v);
    saveSettings({ riders: v });
  };
  const setAreaList = (next: Updater<string[]>) => {
    const v = resolve(next, areaList);
    setAreaListState(v);
    saveSettings({ areas: v });
  };
  const setInvoiceSettings = (v: InvoiceSettings) => {
    setInvoiceSettingsState(v);
    saveSettings({ invoice: v });
  };
  const setTableList = (v: DiningTable[]) => {
    setTableListState(v);
    saveSettings({ tables: v });
  };

  return { backOffice, updateBackOffice, tableList, setTableList, invoiceSettings, setInvoiceSettings, assignRider, menuOverrides, setMenuOverrides, restaurant, setRestaurant, riderList, setRiderList, areaList, setAreaList, rider, setRider, area, setArea, setInvoiceStatus, lines, setLines, orderNo, setOrderNo, orderType, setOrderType, table, setTable, phone, setPhone, address, setAddress, invoices, saveInvoice };
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
