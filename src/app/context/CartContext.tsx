import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { cartService, CartItem } from "@/app/services/cart";
import { authService } from "@/app/services/auth";

interface CartContextType {
  items: CartItem[];
  sessionId: string;
  addToCart: (item: Omit<CartItem, "quantity" | "_id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "cartexpress_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize cart from backend or localStorage on mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        // Ensure token is loaded into API headers and confirm logged-in user
        authService.initializeAuth();

        let userId: string | undefined;
        try {
          const authResponse = await authService.checkLogin();
          userId = authResponse.user?._id;
        } catch {
          userId = authService.getUser()?._id || undefined;
        }

        // Sync cart from backend using userId if available
        const backendCart = await cartService.getCart(userId);

        if (backendCart.items && backendCart.items.length > 0) {
          // Transform backend cart items to local format
          const transformedItems: CartItem[] = backendCart.items.map((item) => ({
            _id: item._id,
            productId: item.productId,
            variantId: item.variantId || "",
            sku: item.sku || item.variantId || item.productId,
            name: item.name || "",
            price: item.price || 0,
            quantity: item.quantity,
            image: item.image || "",
          }));
          setItems(transformedItems);
          return;
        }
      } catch (err) {
        console.error("Failed to sync cart from backend:", err);
      }

      // Fallback: load cart from localStorage if backend sync fails or cart is empty
      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setItems(parsedCart);
        }
      } catch (err) {
        console.error("Failed to load cart from localStorage:", err);
      }
    };

    initializeCart();
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, [items]);

  const addToCart = async (item: Omit<CartItem, "quantity" | "_id">) => {
    // Determine user id if logged in
    let userId = authService.getUser()?._id;
    if (!userId) {
      try {
        const authResponse = await authService.checkLogin();
        userId = authResponse.user?._id;
      } catch {
        userId = undefined;
      }
    }

    // Sync with backend
    cartService
      .addToCart(item.productId, 1, userId, item.variantId)
      .then((response) => {
        // Store the session ID if it's returned (for guest users on first add)
        if (response.sessionId) {
          setSessionId(response.sessionId);
          localStorage.setItem("cartexpress_sessionId", response.sessionId);
        }
        // Update items with their MongoDB IDs from the response
        if (response.cart?.items) {
          const transformedItems: CartItem[] = response.cart.items.map((item) => ({
            _id: item._id,
            productId: item.productId,
            variantId: item.variantId || "",
            sku: item.sku || item.variantId || item.productId,
            name: item.name || "",
            price: item.price || 0,
            quantity: item.quantity,
            image: item.image || "",
          }));
          setItems(transformedItems);
        }
      })
      .catch((err) => {
        console.error("Failed to sync add to cart with backend:", err);
      });
  };

  const removeFromCart = (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item?._id) {
      console.error("Cannot remove item without _id");
      return;
    }

    setItems((prev) => prev.filter((i) => i._id !== id));

    // Sync with backend
    cartService.removeFromCart(item._id).catch((err) => {
      console.error("Failed to sync remove from cart with backend:", err);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const item = items.find((i) => i._id === id);
    if (!item?._id) {
      console.error("Cannot update item without _id");
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, quantity } : i))
    );

    // Sync with backend
    cartService.updateQuantity(item._id, quantity).catch((err) => {
      console.error("Failed to sync quantity update with backend:", err);
    });
  };

  const clearCart = () => {
    setItems([]);

    // Sync with backend
    cartService.clearCart().catch((err) => {
      console.error("Failed to sync clear cart with backend:", err);
    });
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, sessionId, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
