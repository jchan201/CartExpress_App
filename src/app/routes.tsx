import { createBrowserRouter } from "react-router";
import { Root } from "@/app/components/Root";
import { Home } from "@/app/pages/Home";
import { ProductList } from "@/app/pages/ProductList";
import { ProductDetail } from "@/app/pages/ProductDetail";
import { Cart } from "@/app/pages/Cart";
import { Checkout } from "@/app/pages/Checkout";
import { Login } from "@/app/pages/Login";
import { Signup } from "@/app/pages/Signup";
import { Profile } from "@/app/pages/Profile";
import { AdminDashboard } from "@/app/pages/AdminDashboard";
import { Wishlist } from "@/app/pages/Wishlist";
import { OrderHistory } from "@/app/pages/OrderHistory";
import { PaymentConfirmation } from "@/app/pages/PaymentConfirmation";
import { ProductComparison } from "@/app/pages/ProductComparison";
import { NotFound } from "@/app/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: ProductList },
      { path: "products/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "profile", Component: Profile },
      { path: "admin", Component: AdminDashboard },
      { path: "wishlist", Component: Wishlist },
      { path: "orders", Component: OrderHistory },
      { path: "payment-confirmation", Component: PaymentConfirmation },
      { path: "compare", Component: ProductComparison },
      { path: "*", Component: NotFound },
    ],
  },
]);