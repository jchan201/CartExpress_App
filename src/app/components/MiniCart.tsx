import { Link } from "react-router";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cart, removeFromCart, getTotalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Mini Cart Panel */}
      <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Shopping Cart</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1 line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 h-fit"
                    aria-label="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Subtotal:</span>
              <span className="text-xl font-bold text-blue-600">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            <div className="space-y-2">
              <Link
                to="/cart"
                onClick={onClose}
                className="block w-full py-2 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="block w-full py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
