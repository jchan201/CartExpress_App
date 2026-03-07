import apiClient, { ApiResponse } from "./api";

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  _id?: string;
  userId?: string;
  sessionId?: string;
  items: OrderItem[];
  total: number;
  tax: number;
  shippingAddress: string;
  paymentMethod: string;
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt?: string;
}

export interface CreateOrderPayload {
  userId?: string | null;
  sessionId?: string;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  tax: number;
}

export const ordersService = {
  /**
   * Get orders for a specific user
   */
  getUserOrders: async (userId: string): Promise<Order[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Order[]>>(
        `/orders/user/${userId}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch orders for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get a single order by ID
   */
  getOrder: async (orderId: string): Promise<Order> => {
    try {
      const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order
   */
  createOrder: async (orderData: CreateOrderPayload): Promise<Order> => {
    try {
      const response = await apiClient.post<Order>("/orders", {
        userId: orderData.userId || undefined,
        sessionId: orderData.sessionId,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        tax: orderData.tax,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  /**
   * Update order status (admin only)
   * Note: Not yet implemented in backend according to spec
   */
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<Order> => {
    try {
      const response = await apiClient.put<Order>(
        `/orders/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update order status for ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Get all orders (admin only)
   * Note: Not yet implemented in backend according to spec
   */
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Order[]>>("/orders");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch all orders:", error);
      throw error;
    }
  },
};
