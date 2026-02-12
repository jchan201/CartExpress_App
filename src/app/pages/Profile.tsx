import { useNavigate, Link } from "react-router";
import { useAuth } from "@/app/context/AuthContext";
import { User, Mail, Shield, Package } from "lucide-react";
import { useEffect } from "react";
import { useOrders } from "@/app/context/OrderContext";

export function Profile() {
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl mb-1">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-t pt-6">
            <h3 className="text-lg mb-4">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p>{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Order History</h3>
              <Link
                to="/orders"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                View All Orders
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders yet</p>
            ) : (
              <p className="text-gray-600">
                You have {orders.length} order{orders.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="border-t pt-6">
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}