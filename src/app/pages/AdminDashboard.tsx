import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/app/context/AuthContext";
import { Package, ShoppingBag, Edit, Trash2, Plus, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { Product, productsService } from "../services/products";
import { Order, ordersService } from "../services/orders";
import { CloudinaryImageUploader } from "../components/CloudinaryImageUploader";

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    slug: "",
    sku: "",
    price: 0,
    stockQuantity: 0,
    images: [],
    averageRating: 0,
    totalReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products and orders on mount
  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productsService.getProducts();
      setProducts(response.products);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const result = await ordersService.getAllOrders();
      setOrders(result.orders);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const updatedOrder = await ordersService.updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((o) => (o._id === orderId ? updatedOrder : o))
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const deleteAsync = async () => {
        try {
          await productsService.deleteProduct(id);
          setProducts(products.filter((p) => p._id !== id));
        } catch (err) {
          setError("Failed to delete product");
          console.error(err);
        }
      };
      deleteAsync();
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    const saveAsync = async () => {
      try {
        if (!updatedProduct._id) return;
        await productsService.updateProduct(updatedProduct._id, updatedProduct);
        setProducts(
          products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
        );
        setEditingProduct(null);
      } catch (err) {
        setError("Failed to update product");
        console.error(err);
      }
    };
    saveAsync();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const createdProduct = await productsService.createProduct(newProduct);
      setProducts([...products, createdProduct]);
      setIsAddingProduct(false);
      setNewProduct({
        name: "",
        slug: "",
        sku: "",
        price: 0,
        stockQuantity: 0,
        images: [],
        averageRating: 0,
        totalReviews: 0,
      });
    } catch (err) {
      setError("Failed to add product");
      console.error(err);
    }
  };

  const stats = [
    { label: "Total Products", value: products.length, icon: Package },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    {
      label: "Total Revenue",
      value: `$${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`,
      icon: Package,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl mt-2">{stat.value}</p>
              </div>
              <stat.icon className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "orders"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Orders
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl">Manage Products</h2>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images.length > 0 && (<img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />)}
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.categoryId}</td>
                    <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{product.stockQuantity}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl">All Orders</h2>
            {orders.length === 0 && <p className="text-gray-500 text-sm mt-2">No orders yet</p>}
          </div>
          {orders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm text-gray-700">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-gray-700">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-gray-700">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 text-sm font-medium">{order._id?.slice(-8)}</td>
                      <td className="px-6 py-4 text-sm">{order.items.length} item(s)</td>
                      <td className="px-6 py-4 text-sm font-semibold">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(order.createdAt || "").toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status === "delivered" && <CheckCircle className="w-4 h-4" />}
                          {order.status === "shipped" && <Truck className="w-4 h-4" />}
                          {order.status === "processing" && <AlertCircle className="w-4 h-4" />}
                          {order.status?.charAt(0).toUpperCase()}
                          {order.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          disabled={updatingOrderId === order._id}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              order._id!,
                              e.target.value as "pending" | "processing" | "shipped" | "delivered" | "cancelled"
                            )
                          }
                          defaultValue={order.status}
                          className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl mb-4">Edit Product</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProduct(editingProduct);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Stock</label>
                <input
                  type="number"
                  value={editingProduct.stockQuantity}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stockQuantity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <CloudinaryImageUploader
                images={editingProduct.images || []}
                onImagesChange={(images) =>
                  setEditingProduct({
                    ...editingProduct,
                    images,
                  })
                }
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl mb-4">Add New Product</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Slug *</label>
                <input
                  type="text"
                  required
                  value={newProduct.slug || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      slug: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">SKU *</label>
                <input
                  type="text"
                  required
                  value={newProduct.sku || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      sku: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProduct.price || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  value={newProduct.stockQuantity || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      stockQuantity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <CloudinaryImageUploader
                images={newProduct.images || []}
                onImagesChange={(images) =>
                  setNewProduct({
                    ...newProduct,
                    images,
                  })
                }
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Adding..." : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setError(null);
                  }}
                  className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}