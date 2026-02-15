import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, User, LogOut, Search, Heart, Scale } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useComparison } from "@/app/context/ComparisonContext";
import { MiniCart } from "./MiniCart";

export function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { wishlist } = useWishlist();
  const { comparisonList } = useComparison();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  const itemCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link to="/" className="text-xl font-semibold text-gray-900 whitespace-nowrap">
              CartExpress
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                to="/products"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Products
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="relative">
              <Heart className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
              {wishlist?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/compare" className="relative">
              <Scale className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
              {comparisonList?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {comparisonList.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMiniCartOpen(!isMiniCartOpen)}
              className="relative"
            >
              <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <User className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
    </header>
  );
}