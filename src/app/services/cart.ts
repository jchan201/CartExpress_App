import apiClient, { ApiResponse } from "./api";

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name?: string;
  price?: number;
  image?: string;
}

export interface Cart {
  userId?: string;
  sessionId: string;
  items: CartItem[];
  total: number;
  updatedAt?: string;
}

export const cartService = {
  /**
   * Get cart for user or session
   */
  getCart: async (
    userId?: string | null,
    sessionId?: string
  ): Promise<Cart> => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (sessionId) params.append("sessionId", sessionId);

      const response = await apiClient.get<ApiResponse<Cart>>(
        "/cart",
        params.toString() ? { params: Object.fromEntries(params) } : undefined
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      throw error;
    }
  },

  /**
   * Add item to cart
   */
  addToCart: async (
    productId: string,
    quantity: number,
    userId?: string | null,
    sessionId?: string,
    variantId?: string
  ): Promise<Cart> => {
    try {
      const response = await apiClient.post<Cart>("/cart/items", {
        productId,
        quantity,
        variantId,
        userId: userId || undefined,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (
    productId: string,
    userId?: string | null,
    sessionId?: string
  ): Promise<Cart> => {
    try {
      const response = await apiClient.post<Cart>("/cart/remove", {
        productId,
        userId: userId || undefined,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  },

  /**
   * Update item quantity in cart
   */
  updateQuantity: async (
    productId: string,
    quantity: number,
    userId?: string | null,
    sessionId?: string
  ): Promise<Cart> => {
    try {
      const response = await apiClient.post<Cart>("/cart/update", {
        productId,
        quantity,
        userId: userId || undefined,
        sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      throw error;
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async (
    userId?: string | null,
    sessionId?: string
  ): Promise<void> => {
    try {
      await apiClient.post("/cart/clear", {
        userId: userId || undefined,
        sessionId,
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  },
};
