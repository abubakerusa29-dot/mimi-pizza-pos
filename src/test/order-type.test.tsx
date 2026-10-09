import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartPanel } from "@/components/pos/CartPanel";
import { OrderProvider, useOrder } from "@/components/pos/OrderContext";
import { cartTotals } from "@/lib/cart";

afterEach(cleanup);

describe("Delivery orders", () => {
  it("can select Delivery alongside Dine-in and Takeaway", () => {
    const setOrderType = vi.fn();
    render(<CartPanel lines={[]} orderNo={1001} orderType="Dine-in" table="" setOrderType={setOrderType} setTable={vi.fn()} onQty={vi.fn()} onClear={vi.fn()} onNewOrder={vi.fn()} onPrint={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Delivery" }));
    expect(setOrderType).toHaveBeenCalledWith("Delivery");
  });

  it("preserves the current cart and total when Delivery is selected", () => {
    let observed: ReturnType<typeof useOrder> | undefined;
    function Harness() {
      const order = useOrder();
      observed = order;
      return <button onClick={() => {
        order.setLines([{ key: "deal-1", name: "Deal 1", unitPrice: 1460, qty: 1 }]);
        order.setOrderType("Delivery");
      }}>Set delivery order</button>;
    }
    render(<OrderProvider><Harness /></OrderProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Set delivery order" }));
    expect(observed?.orderType).toBe("Delivery");
    expect(cartTotals(observed?.lines ?? []).total).toBe(1460);
    expect(observed?.lines).toHaveLength(1);
  });
});