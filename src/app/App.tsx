import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { CartProvider } from "@/app/context/CartContext";
import { AuthProvider } from "@/app/context/AuthContext";
import { WishlistProvider } from "@/app/context/WishlistContext";
import { RecentlyViewedProvider } from "@/app/context/RecentlyViewedContext";
import { OrderProvider } from "@/app/context/OrderContext";
import { ComparisonProvider } from "@/app/context/ComparisonContext";

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <OrderProvider>
            <ComparisonProvider>
              <RecentlyViewedProvider>
                <RouterProvider router={router} />
              </RecentlyViewedProvider>
            </ComparisonProvider>
          </OrderProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}