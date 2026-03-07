import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Star, X, SlidersHorizontal, Heart, Eye, Scale, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useWishlist } from "@/app/context/WishlistContext";
import { useComparison } from "@/app/context/ComparisonContext";
import { QuickViewModal } from "@/app/components/QuickViewModal";
import { toast } from "sonner";
import { productsService, Product } from "@/app/services/products";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "rating-asc" | "rating-desc";

const PRODUCTS_PER_PAGE = 12;

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchQuery = searchParams.get("search") || "";
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToComparison, removeFromComparison, isInComparison, comparisonList } = useComparison();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await productsService.getProducts({
          limit: 100, // Adjust as needed
          page: 1,
        });

        // Handle both array and object responses
        const productList = Array.isArray(result) ? result : result.products;
        setProducts(productList);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load products";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.categoryId || "Other")))];

  // Calculate min and max prices from products
  const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 2000;

  useEffect(() => {
    // Clear category filter when search is active
    if (searchQuery) {
      setSelectedCategory("All");
    }
  }, [searchQuery]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [selectedCategory, sortBy, priceRange, minRating, searchQuery]);

  const filteredProducts = products.filter((product) => {
    // Apply category filter
    const categoryMatch =
      selectedCategory === "All" || product.categoryId === selectedCategory;

    // Apply search filter
    const searchMatch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    // Apply price range filter
    const priceMatch = (product.price) >= priceRange[0] && (product.price) <= priceRange[1];

    // Apply rating filter
    const ratingMatch = (product.averageRating) >= minRating;

    return categoryMatch && searchMatch && priceMatch && ratingMatch;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return (a.price) - (b.price);
      case "price-desc":
        return (b.price) - (a.price);
      case "rating-asc":
        return (a.averageRating) - (b.averageRating);
      case "rating-desc":
        return (b.averageRating) - (a.averageRating);
      default:
        return 0;
    }
  });

  const clearSearch = () => {
    setSearchParams({});
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 2000]);
    setMinRating(0);
  };

  const hasActiveFilters = 
    selectedCategory !== "All" || 
    priceRange[0] !== 0 || 
    priceRange[1] !== 2000 || 
    minRating > 0;

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Products</h1>
        
        {/* Sort Dropdown */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600 hidden sm:inline">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
              <option value="rating-desc">Rating (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-6 flex items-center gap-2">
          <p className="text-gray-600">
            Showing results for: <strong>"{searchQuery}"</strong>
          </p>
          <button
            onClick={clearSearch}
            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm"
          >
            Clear
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      disabled={!!searchQuery}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      } ${searchQuery ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">Min: ${priceRange[0]}</label>
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Max: ${priceRange[1]}</label>
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>-</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">Minimum Rating</h3>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                        minRating === rating
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating
                                ? minRating === rating
                                  ? "fill-white text-white"
                                  : "fill-yellow-400 text-yellow-400"
                                : minRating === rating
                                ? "text-white"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm">
                        {rating === 0 ? "All" : `${rating}+ stars`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <strong>{sortedProducts.length}</strong> of{" "}
                  <strong>{products.length}</strong> products
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 text-lg mt-4">Loading products...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-600">Failed to Load Products</h3>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product) => {
                const primaryImage = product.thumbnail || product.images?.[0] || "/placeholder.png";
                const displayPrice = product.comparePrice ? product.price : null;

                return (
                  <div
                    key={product.sku}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInWishlist(product.sku)) {
                          removeFromWishlist(product.sku);
                          toast.success("Removed from wishlist");
                        } else {
                          addToWishlist(product);
                          toast.success("Added to wishlist");
                        }
                      }}
                      className="absolute top-2 left-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isInWishlist(product.sku)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuickViewProduct(product);
                        setIsQuickViewOpen(true);
                      }}
                      className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isInComparison(product.sku)) {
                          removeFromComparison(product.sku);
                          toast.success("Removed from comparison");
                        } else {
                          if (comparisonList.length >= 4) {
                            toast.error("You can compare up to 4 products");
                          } else {
                            addToComparison(product);
                            toast.success("Added to comparison");
                          }
                        }
                      }}
                      className="absolute top-12 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Scale
                        className={`w-5 h-5 ${
                          isInComparison(product.sku)
                            ? "text-purple-600"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                    <Link to={`/products/${product._id}`}>
                      <div className="relative overflow-hidden">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.stockQuantity < (product.lowStockThreshold || 10) && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg mb-2 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {product.averageRating.toFixed(1)} ({product.totalReviews})
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xl text-blue-600 font-semibold">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.comparePrice && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ${product.comparePrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          Stock: {product.stockQuantity}
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="mx-4 text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
      />
    </div>
  );
}