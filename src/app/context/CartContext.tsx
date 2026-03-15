import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getOrCreateSessionId } from "@/app/utilities/sessionId";
import { cartService } from "@/app/services/cart";
import { authService } from "@/app/services/auth";

export interface CartItem {
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  sessionId: string;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
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

  // Initialize session ID and sync cart from backend on mount
  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);

    const initializeCart = async () => {
      try {
        // Get user from auth service if logged in
        const user = authService.getUser();
        const userId = user?._id;

        // Sync cart from backend
        const backendCart = await cartService.getCart(userId, id);

        if (backendCart.items && backendCart.items.length > 0) {
          // Transform backend cart items to local format
          const transformedItems: CartItem[] = backendCart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || "",
            sku: item.variantId || item.productId,
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

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku);
      if (existing) {
        return prev.map((i) =>
          i.sku === item.sku ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // Sync with backend
    const user = authService.getUser();
    const existingItem = items.find((i) => i.sku === item.sku);
    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
    cartService.addToCart(item.productId, newQuantity, user?._id, sessionId).catch((err) => {
      console.error("Failed to sync add to cart with backend:", err);
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.sku !== id));

    // Sync with backend
    const user = authService.getUser();
    cartService.removeFromCart(id, user?._id, sessionId).catch((err) => {
      console.error("Failed to sync remove from cart with backend:", err);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.productId === id ? { ...item, quantity } : item))
    );

    // Sync with backend
    const user = authService.getUser();
    cartService.updateQuantity(id, quantity, user?._id, sessionId).catch((err) => {
      console.error("Failed to sync quantity update with backend:", err);
    });
  };

  const clearCart = () => {
    setItems([]);

    // Sync with backend
    const user = authService.getUser();
    cartService.clearCart(user?._id, sessionId).catch((err) => {
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
