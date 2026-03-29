import apiClient, { ApiResponse } from "./api";

export interface CartItem {
  _id: string; // MongoDB document ID for backend sync
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  discount?: number;
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

      const response = await apiClient.get<ApiResponse<{ cart: Cart }>>(
        "/cart",
        params.toString() ? { params: Object.fromEntries(params) } : undefined
      );
      return response.data.data.cart;
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      throw error;
    }
  },

  /**
   * Add item to cart
   * Returns cart and sessionId (for guest users on first add)
   */
  addToCart: async (
    productId: string,
    quantity: number,
    userId?: string | null,
    variantId?: string
  ): Promise<{ cart: Cart; sessionId?: string }> => {
    try {
      const response = await apiClient.post<ApiResponse<{ cart: Cart; sessionId?: string }>>(
        "/cart/items",
        {
          productId,
          quantity,
          variantId,
          userId: userId || undefined,
        }
      );
      return {
        cart: response.data.data.cart,
        sessionId: response.data.sessionId,
      };
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  },

  /**
   * Remove item from cart by item ID
   */
  removeFromCart: async (
    itemId: string
  ): Promise<Cart> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ cart: Cart }>>(
        `/cart/items/${itemId}`
      );
      return response.data.data.cart;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  },

  /**
   * Update item quantity in cart by item ID
   */
  updateQuantity: async (
    itemId: string,
    quantity: number
  ): Promise<Cart> => {
    try {
      const response = await apiClient.put<ApiResponse<{ cart: Cart }>>(
        `/cart/items/${itemId}`,
        { quantity }
      );
      return response.data.data.cart;
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      throw error;
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<void> => {
    try {
      await apiClient.delete("/cart");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  },
};
