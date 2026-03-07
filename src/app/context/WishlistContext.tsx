import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/app/services/products";

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productSku: string) => void;
  isInWishlist: (productSku: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.sku === product.sku)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productSku: string) => {
    setWishlist((prev) => prev.filter((p) => p.sku !== productSku));
  };

  const isInWishlist = (productSku: string) => {
    return wishlist.some((p) => p.sku === productSku);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
