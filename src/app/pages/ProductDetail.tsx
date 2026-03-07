import { useParams, useNavigate } from "react-router";
import { Star, ShoppingCart, ArrowLeft, Heart, AlertCircle } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useRecentlyViewed } from "@/app/context/RecentlyViewedContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router";
import { ProductImageGallery } from "@/app/components/ProductImageGallery";
import { productsService, Product } from "@/app/services/products";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed, recentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const fetchedProduct = await productsService.getProductById(id);
        setProduct(fetchedProduct);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load product";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-600">Product Not Found</h3>
          </div>
          <p className="text-red-700 mb-4">{error || "The product you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/products")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            View All Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.thumbnail || product.images?.[0] || "",
      quantity: 1,
    } as any);
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = () => {
    const productId = product.sku;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  // Filter recently viewed to exclude current product
  const otherRecentlyViewed = recentlyViewed.filter((p) => p.sku !== (product.sku));

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <ProductImageGallery
              images={product.images && product.images.length > 0 ? product.images : [product.thumbnail || "/placeholder.png"]}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div>
            <span className="text-sm text-gray-500">{product.categoryId || "Uncategorized"}</span>
            <h1 className="text-3xl mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl text-blue-600">
                ${product.price.toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="ml-3 text-xl text-gray-500 line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description || product.shortDescription}</p>

            <div className="mb-6">
              <span className="text-sm text-gray-600">
                Availability:{" "}
                <span
                  className={
                    product.stockQuantity > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {product.stockQuantity > 0
                    ? `${product.stockQuantity} in stock`
                    : "Out of stock"}
                </span>
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.sku)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Recently Viewed Products */}
        {otherRecentlyViewed.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {otherRecentlyViewed.map((recentProduct, index) => (
                <Link
                  key={index}
                  to={`/products/${recentProduct._id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {recentProduct.images && recentProduct.images.length > 0 && (<div className="relative">
                    <img
                      src={recentProduct.images[0] || "/placeholder.png"}
                      alt={recentProduct.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>)}
                  <div className="p-3">
                    <h3 className="text-sm mb-1 line-clamp-2">{recentProduct.name}</h3>
                    <p className="text-blue-600 font-semibold">
                      ${recentProduct.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}