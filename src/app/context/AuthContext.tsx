import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  signup: (email: string, password: string, name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Mock login - in real app, this would call an API
    if (email === "admin@example.com") {
      setUser({
        id: "1",
        email,
        name: "Admin User",
        role: "admin",
      });
    } else {
      setUser({
        id: "2",
        email,
        name: "Customer User",
        role: "customer",
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const signup = (email: string, password: string, name: string) => {
    // Mock signup
    setUser({
      id: Date.now().toString(),
      email,
      name,
      role: "customer",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
