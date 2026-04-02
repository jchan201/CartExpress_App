import apiClient, { ApiResponse } from "./api";
import { CartItem } from "./cart";

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

export interface PaymentStatus {
  status: "pending" | "completed" | "failed" | "refunded";
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export const paymentsService = {
  createPaymentIntent: async (items: CartItem[], tax?: number): Promise<CreatePaymentIntentResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<CreatePaymentIntentResponse>>( 
        "/payments/create-intent",
        { items, tax }
      );

      return response.data.data;
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      throw error;
    }
  },
  
  verifyPaymentIntent: async (paymentIntentId: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse>(
        `/payments/verify-intent`,
        { stripePaymentIntentId: paymentIntentId }
      );
      return response.data.success;
    } catch (error) {
      console.error(`Failed to verify payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  },

  getPaymentByOrder: async (orderId: string): Promise<PaymentStatus> => {
    try {
      const response = await apiClient.get<ApiResponse<{ payment: PaymentStatus }>>(
        `/payments/${orderId}`
      );
      return response.data.data.payment;
    } catch (error) {
      console.error(`Failed to fetch payment for order ${orderId}:`, error);
      throw error;
    }
  },
};
