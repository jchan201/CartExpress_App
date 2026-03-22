import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ordersService } from "@/app/services/orders";
import { useAuth } from "./AuthContext";

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
  isLoading: boolean;
  error: string | null;
  addOrder: (order: Omit<Order, "id" | "orderDate" | "status">) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user orders when user logs in
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (user?._id) {
        setIsLoading(true);
        try {
          const userOrders = await ordersService.getUserOrders(user._id);
          setOrders(
            userOrders.map((order) => ({
              id: order._id || "",
              items: order.items.map((item) => ({
                id: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: "",
              })),
              total: order.total,
              tax: order.tax,
              status: (order.status as "processing" | "shipped" | "delivered" | "cancelled") || "processing",
              orderDate: order.createdAt || new Date().toISOString(),
              shippingAddress: order.shippingAddress,
              paymentMethod: order.paymentMethod,
            }))
          );
          setError(null);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Failed to fetch orders";
          setError(errorMsg);
          console.error("Failed to fetch orders:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserOrders();
  }, [user?._id]);

  const addOrder = async (orderData: Omit<Order, "id" | "orderDate" | "status">) => {
    setIsLoading(true);
    setError(null);
    try {
      // Prepare order items for API
      const apiOrderItems = orderData.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      const tax = orderData.tax || (orderData.total * 0.1);

      // Call backend API to create order
      const createdOrder = await ordersService.createOrder({
        userId: user?._id || null,
        items: apiOrderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || "card",
        tax: tax,
      });

      // Add order to local state
      const newOrder: Order = {
        id: createdOrder._id || `ORD-${Date.now()}`,
        items: orderData.items,
        total: createdOrder.total,
        tax: createdOrder.tax,
        status: (createdOrder.status as "processing" | "shipped" | "delivered" | "cancelled") || "processing",
        orderDate: createdOrder.createdAt || new Date().toISOString(),
        shippingAddress: createdOrder.shippingAddress,
        paymentMethod: createdOrder.paymentMethod,
      };

      setOrders((prev) => [newOrder, ...prev]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create order";
      setError(errorMsg);
      console.error("Failed to create order:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, isLoading, error, addOrder }}>
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
