import { useParams, useNavigate } from "react-router";
import { Star, ShoppingCart, ArrowLeft, Heart } from "lucide-react";
import { getProductById, products } from "@/app/data/products";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useRecentlyViewed } from "@/app/context/RecentlyViewedContext";
import { useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router";
import { ProductBadge } from "@/app/components/ProductBadge";
import { ProductImageGallery } from "@/app/components/ProductImageGallery";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed, recentlyViewed } = useRecentlyViewed();

  const product = getProductById(id!);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [id]); // Only re-run when the product ID changes

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  // Filter recently viewed to exclude current product
  const otherRecentlyViewed = recentlyViewed.filter((p) => p.id !== product.id);

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
              images={product.images || [product.image]}
              productName={product.name}
            />
            {product.badge && (
              <div className="absolute top-4 left-4 z-10">
                <ProductBadge type={product.badge} />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <span className="text-sm text-gray-500">{product.category}</span>
            <h1 className="text-3xl mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl text-blue-600">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="ml-3 text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="mb-6">
              <span className="text-sm text-gray-600">
                Availability:{" "}
                <span
                  className={
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
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
                    isInWishlist(product.id)
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
              {otherRecentlyViewed.map((recentProduct) => (
                <Link
                  key={recentProduct.id}
                  to={`/products/${recentProduct.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={recentProduct.image}
                      alt={recentProduct.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
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