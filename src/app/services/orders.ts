import apiClient, { ApiResponse } from "./api";
import { User } from "./auth";
import { CartItem } from "./cart";

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  tax: number;
  subtotal: number;
  total: number;
}

export interface Address {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Order {
  _id: string;
  createdAt: string;
  updatedAt: string;

  orderNumber: string;
  userId?: User;
  items: OrderItem[];

  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;

  status: "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  fulfillmentStatus?: "unfulfilled" | "partial" | "fulfilled";

  shippingAddress: Address;
  billingAddress: Address;
  
  shippingMethod: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: Date;
  shippedAt: Date;
  deliveredAt: Date;

  paymentMethod: string;
  paymentId: string;

  notes: string;
  customerNotes: string;
  couponCode: string;
  refundAmount: number;
  refundReason: string;
  cancelledAt: Date;
  cancellationReason: string;
}

export interface CreateOrderPayload {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  customerNotes?: string;
  couponCode?: string;
  items?: CartItem[]; // Optional - backend can pull from cart if not provided
  tax?: number; // Optional - backend can calculate tax if not provided
}

export const ordersService = {
  /**
   * Get current user's orders (with pagination)
   * GET /api/orders
   */
  getUserOrders: async (page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number; page: number; pages: number }> => {
    try {
      const response = await apiClient.get<ApiResponse<{ orders: Order[]; total: number; page: number; pages: number }>>(
        "/orders",
        { params: { page, limit } }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
      throw error;
    }
  },

  /**
   * Get a single order by ID
   * GET /api/orders/:id
   */
  getOrder: async (orderId: string): Promise<Order> => {
    try {
      const response = await apiClient.get<ApiResponse<{ order: Order }>>(`/orders/${orderId}`);
      return response.data.data.order;
    } catch (error) {
      console.error(`Failed to fetch order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order (cart will be cleared on success)
   * POST /api/orders
   */
  createOrder: async (orderData: CreateOrderPayload): Promise<Order> => {
    try {
      const response = await apiClient.post<ApiResponse<{ order: Order }>>("/orders", orderData);
      return response.data.data.order;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  /**
   * Cancel an order (only pending/processing orders can be cancelled)
   * PUT /api/orders/:id/cancel
   */
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    try {
      const response = await apiClient.put<ApiResponse<{ order: Order }>>(
        `/orders/${orderId}/cancel`,
        { reason }
      );
      return response.data.data.order;
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Get all orders (admin only, with pagination and status filter)
   * GET /api/admin/orders
   */
  getAllOrders: async (page: number = 1, limit: number = 20, status?: string): Promise<{ orders: Order[]; total: number; page: number; pages: number }> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (status) params.status = status;

      const response = await apiClient.get<ApiResponse<{ orders: Order[]; total: number; page: number; pages: number }>>(
        "/admin/orders",
        { params }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch all orders:", error);
      throw error;
    }
  },

  /**
   * Update order status (admin only)
   * PUT /api/admin/orders/:id/status
   */
  updateOrderStatus: async (
    orderId: string,
    status: string,
    trackingNumber?: string,
    carrier?: string
  ): Promise<Order> => {
    try {
      const payload: Record<string, any> = { status };
      if (trackingNumber) payload.trackingNumber = trackingNumber;
      if (carrier) payload.carrier = carrier;

      const response = await apiClient.put<ApiResponse<{ order: Order }>>(
        `/admin/orders/${orderId}/status`,
        payload
      );
      return response.data.data.order;
    } catch (error) {
      console.error(`Failed to update order status for ${orderId}:`, error);
      throw error;
    }
  },
};
