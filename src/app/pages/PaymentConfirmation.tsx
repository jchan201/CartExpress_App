import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { paymentsService } from "@/app/services/payments";
import { useOrders } from "../context/OrderContext";

const CHECKOUT_DATA_KEY = "cartexpress_checkout_data";

export function PaymentConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addOrder } = useOrders();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const paymentIntent = searchParams.get("payment_intent");

  useEffect(() => {
    const verifyPaymentAndCreateOrder = async () => {
      try {
        if (!paymentIntent) {
          setStatus("error");
          setMessage("No payment information found. Please try again.");
          return;
        }

        // Verify the payment intent
        const paymentVerified = await paymentsService.verifyPaymentIntent(paymentIntent);
        if (!paymentVerified) {
          setStatus("error");
          setMessage("Payment verification failed. Please try again.");
          return;
        }

        // Retrieve checkout data from localStorage
        const checkoutDataStr = localStorage.getItem(CHECKOUT_DATA_KEY);
        if (!checkoutDataStr) {
          setStatus("error");
          setMessage("Checkout data not found. Please try again.");
          return;
        }

        const checkoutData = JSON.parse(checkoutDataStr);

        // Create the order with the verified payment
        const order = await addOrder({
          shippingAddress: checkoutData.shippingAddress,
          billingAddress: checkoutData.billingAddress,
          paymentMethod: checkoutData.paymentMethod || "card",
          customerNotes: checkoutData.customerNotes,
          couponCode: checkoutData.couponCode,
          tax: checkoutData.tax || 0,
          stripePaymentIntentId: paymentIntent,
        });

        // Clear the checkout data from localStorage
        localStorage.removeItem(CHECKOUT_DATA_KEY);

        setStatus("success");
        setMessage(`Payment successful! Your order #${order.orderNumber} has been placed.`);
      } catch (error) {
        setStatus("error");
        const errorMessage = error instanceof Error ? error.message : "Payment verification failed";
        setMessage(errorMessage);
      }
    };

    verifyPaymentAndCreateOrder();
  }, [paymentIntent]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Processing Your Payment</h1>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-green-600">Payment Successful!</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/orders")}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Order History
              </button>
              <button
                onClick={() => navigate("/")}
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 text-red-600">Payment Failed</h1>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/checkout")}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
