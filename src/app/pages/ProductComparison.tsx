import { useComparison } from "@/app/context/ComparisonContext";
import { X, Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "@/app/context/CartContext";
import { toast } from "sonner";
import { Product } from "../services/products";

export function ProductComparison() {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product._id,
      variantId: product.variants && product.variants.length > 0 ? product.variants[0]._id : undefined,
      sku: product.sku,
      name: product.name,
      price: (product.price),
      image: product.images[0],
    });
    toast.success("Added to cart!");
  };

  if (comparisonList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl mb-8">Product Comparison</h1>
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h2 className="text-xl mb-2">No Products to Compare</h2>
          <p className="text-gray-600 mb-6">
            Add products to comparison from the products page.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl">Product Comparison</h1>
        {comparisonList.length > 0 && (
          <button
            onClick={clearComparison}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full">
          <tbody>
            {/* Product Images */}
            <tr className="border-b">
              <td className="p-4 font-semibold bg-gray-50 w-48">Product</td>
              {comparisonList.map((product) => (
                <td key={product.sku} className="p-4 text-center relative">
                  <button
                    onClick={() => removeFromComparison(product.sku)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    aria-label="Remove from comparison"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold hover:text-blue-600">
                      {product.name}
                    </h3>
                  </Link>
                </td>
              ))}
            </tr>

            {/* Price */}
            <tr className="border-b">
              <td className="p-4 font-semibold bg-gray-50">Price</td>
              {comparisonList.map((product) => (
                <td key={product.sku} className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.comparePrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ${product.comparePrice.toFixed(2)}
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="border-b">
              <td className="p-4 font-semibold bg-gray-50">Rating</td>
              {comparisonList.map((product) => (
                <td key={product.sku} className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
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
                  <div className="text-sm text-gray-600">
                    {product.averageRating} ({product.totalReviews} reviews)
                  </div>
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr className="border-b">
              <td className="p-4 font-semibold bg-gray-50">Category</td>
              {comparisonList.map((product) => (
                <td key={product.sku} className="p-4 text-center">
                  {typeof product.categoryId === "object"
                    ? product.categoryId.name
                    : product.categoryId || "Uncategorized"}
                </td>
              ))}
            </tr>

            {/* Description */}
            <tr className="border-b">
              <td className="p-4 font-semibold bg-gray-50">Description</td>
              {comparisonList.map((product) => (
                <td key={product.sku} className="p-4">
                  <p className="text-sm text-gray-600">{product.description || product.shortDescription}</p>
                </td>
              ))}
            </tr>

            {/* Stock */}
            <tr className="border-b">
              <td className="p-4 font-semibold bg-gray-50">Availability</td>
              {comparisonList.map((product) => (
                <td key={product.sku} className="p-4 text-center">
                  <span
                    className={
                      product.stockQuantity > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {product.stockQuantity > 0
                      ? `${product.stockQuantity} in stock`
                      : "Out of stock"}
                  </span>
                </td>
              ))}
            </tr>

            {/* Add to Cart */}
            <tr>
              <td className="p-4 font-semibold bg-gray-50">Actions</td>
              {comparisonList.map((product) => (
                <td key={product.sku} className="p-4 text-center">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stockQuantity === 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
