import { Product } from "@/app/services/products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { toast } from "sonner";
import { Link } from "react-router";
import { ProductBadge } from "@/app/components/ProductBadge";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const { addToCart, items } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const checkQtyInCart = () => {
    const cartItem = items.find((item) => item.sku === product.sku);
    const cartQuantity = cartItem ? cartItem.quantity : 0;
    return product.stockQuantity - cartQuantity > 0;
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,
      variantId: product.variants && product.variants.length > 0 ? product.variants[0]._id : "",
      sku: product.sku,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = () => {
    if (isInWishlist(product.sku)) {
      removeFromWishlist(product.sku);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick View</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full rounded-lg"
            />
            {product.isFeatured && (
              <div className="absolute top-4 left-4">
                <ProductBadge type="bestseller" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold mb-3">{product.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.averageRating} ({product.totalReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl text-blue-600 font-semibold">
                ${product.price.toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="ml-3 text-lg text-gray-500 line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-6">{product.description || product.shortDescription}</p>

            {/* Stock */}
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

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || !checkQtyInCart()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {checkQtyInCart() ? "Add to Cart" : "Max Quantity in Cart Reached"}
              </button>
              <button
                onClick={handleToggleWishlist}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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

            {/* View Full Details Link */}
            <Link
              to={`/products/${product._id}`}
              onClick={onClose}
              className="mt-4 text-center text-blue-600 hover:text-blue-700 text-sm"
            >
              View Full Details →
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
