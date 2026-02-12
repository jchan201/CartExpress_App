import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/app/data/products";

interface ComparisonContextType {
  comparisonList: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisonList, setComparisonList] = useState<Product[]>([]);

  const addToComparison = (product: Product) => {
    setComparisonList((prev) => {
      // Check if already in comparison
      if (prev.find((p) => p.id === product.id)) {
        return prev;
      }
      // Limit to 4 products for comparison
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId: string) => {
    setComparisonList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (productId: string) => {
    return comparisonList.some((p) => p.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
