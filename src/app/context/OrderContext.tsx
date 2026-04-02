import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CreateOrderPayload, Order, ordersService } from "@/app/services/orders";
import { useAuth } from "./AuthContext";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  addOrder: (orderData: CreateOrderPayload) => Promise<Order>;
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
          const result = await ordersService.getUserOrders();
          setOrders(result.orders);
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

  const addOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
    setIsLoading(true);
    setError(null);
    try {
      // Call backend API to create order (cart items are pulled from backend cart)
      const createdOrder = await ordersService.createOrder(orderData);

      // Add order to local state
      setOrders((prev) => [createdOrder, ...prev]);
      return createdOrder;
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
