import { Link } from "react-router";
import { useRecentlyViewed } from "@/app/context/RecentlyViewedContext";
import { Clock } from "lucide-react";

export function RecentlyViewedSection() {
  const { recentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl">Recently Viewed</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentlyViewed.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-blue-600 font-semibold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
