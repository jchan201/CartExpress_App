import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { paymentsService } from "@/app/services/payments";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { Button } from "@/app/components/ui/button";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const CHECKOUT_DATA_KEY = "cartexpress_checkout_data";

// Inner component that uses Stripe hooks
function CheckoutForm({ items, total }: { items: any[]; total: number }) {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        return;
      }

      // Save checkout data to localStorage before redirecting to payment
      const checkoutData = {
        shippingAddress: {
          fullName: formData.fullName,
          addressLine1: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        billingAddress: {
          fullName: formData.fullName,
          addressLine1: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        paymentMethod: "card",
        customerEmail: formData.email,
      };

      localStorage.setItem(CHECKOUT_DATA_KEY, JSON.stringify(checkoutData));

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL where the user is redirected after the payment
          return_url: `${window.location.origin}/payment-confirmation`,
        },
      });
      if (error) throw error;

      clearCart();

      toast.success("Order placed! Payment is processing. ");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      toast.error(message);
      console.error("Checkout error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items || items.length === 0) {
    return <p className="p-6">Your cart is empty. Add items before checking out.</p>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl mb-4">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Postal Code / ZIP Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl mb-4">Payment Information</h2>
                <PaymentElement />
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                globalWait
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.sku} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${(total * 0.13).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-xl">
                  <span>Total</span>
                  <span>${(total * 1.13).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Outer component that creates the payment intent and provides Elements context
export function Checkout() {
  const { items, total } = useCart();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items.length, navigate]);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { clientSecret, paymentId } = await paymentsService.createPaymentIntent(items);
        setClientSecret(clientSecret);
        setPaymentId(paymentId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to initialize payment";
        toast.error(message);
        console.error("Payment intent creation error:", error);
      }
    };

    if (items.length > 0) {
      createPaymentIntent();
    }
  }, [items]);

  if (!items || items.length === 0) {
    return <p className="p-6">Your cart is empty. Add items before checking out.</p>;
  }

  const stripeOptions: StripeElementsOptions = {
    clientSecret,
  };

  return (
    <>
      <Toaster position="top-right" />
      {clientSecret ? (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <CheckoutForm items={items} total={total} />
        </Elements>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center">Loading payment details...</p>
        </div>
      )}
    </>
  );
}