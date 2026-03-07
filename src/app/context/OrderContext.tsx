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
  tax?: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: string;
  paymentMethod?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "orderDate" | "status">) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  // Note: localStorage persistence removed
  // Orders are now managed via backend API.
  // To fetch user orders from backend, uncomment the code below and provide userId

  // useEffect(() => {
  //   const fetchUserOrders = async () => {
  //     const userId = useAuth()?.user?.id; // Get from auth context
  //     if (userId) {
  //       try {
  //         const userOrders = await ordersService.getUserOrders(userId);
  //         setOrders(userOrders.map(order => ({
  //           ...order,
  //           id: order._id || order.id,
  //         })));
  //       } catch (err) {
  //         console.error("Failed to fetch orders:", err);
  //       }
  //     }
  //   };
  //   fetchUserOrders();
  // }, []);

  const addOrder = (orderData: Omit<Order, "id" | "orderDate" | "status">) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      orderDate: new Date().toISOString(),
      status: "processing",
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Optional: Sync with backend
    // await ordersService.createOrder({
    //   userId: getCurrentUserId(),
    //   sessionId: getSessionId(),
    //   items: orderData.items,
    //   shippingAddress: orderData.shippingAddress,
    //   paymentMethod: orderData.paymentMethod || "card",
    //   tax: orderData.tax || 0,
    // });
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
