import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { registerApiBusyListener } from "@/app/services/api";

interface ApiBusyContextValue {
  pending: number;
  isBusy: boolean;
}

const ApiBusyContext = createContext<ApiBusyContextValue | undefined>(undefined);

export function ApiBusyProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const cleanup = registerApiBusyListener(setPending);
    return cleanup;
  }, []);

  return (
    <ApiBusyContext.Provider value={{ pending, isBusy: pending > 0 }}>
      {children}
    </ApiBusyContext.Provider>
  );
}

export function useApiBusy() {
  const context = useContext(ApiBusyContext);
  if (!context) {
    throw new Error("useApiBusy must be used within an ApiBusyProvider");
  }
  return context;
}
