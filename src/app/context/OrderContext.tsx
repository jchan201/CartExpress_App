import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "orderDate" | "status">) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("orders");
    if (stored) {
      try {
        setOrders(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse orders:", e);
      }
    }
  }, []);

  // Save to localStorage whenever orders change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }, [orders]);

  const addOrder = (orderData: Omit<Order, "id" | "orderDate" | "status">) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      orderDate: new Date().toISOString(),
      status: "processing",
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
