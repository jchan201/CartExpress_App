import { useNavigate, Link } from "react-router";
import { useAuth } from "@/app/context/AuthContext";
import { User, Mail, Shield, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrders } from "@/app/context/OrderContext";
import apiClient from "@/app/services/api";

export function Profile() {
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  const handleMakeAdmin = async () => {
    setAdminLoading(true);
    setAdminMessage(null);
    try {
      await apiClient.post("/auth/make-admin", { email: user.email });
      setAdminMessage({ type: "success", text: "Admin role granted successfully!" });
    } catch (error) {
      console.error("Failed to make admin:", error);
      setAdminMessage({
        type: "error",
        text: "Failed to grant admin role",
      });
    } finally {
      setAdminLoading(false);
    }
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
            <h2 className="text-2xl mb-1">{user.firstName} {user.lastName}</h2>
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
                  <p>{user.firstName} {user.lastName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="capitalize">{user.role}</p>
                </div>
              </div>
              {import.meta.env.DEV && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <button
                    onClick={handleMakeAdmin}
                    disabled={adminLoading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {adminLoading ? "Processing..." : "Make Admin (Dev)"}
                  </button>
                  {adminMessage && (
                    <span
                      className={`text-sm ${
                        adminMessage.type === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {adminMessage.text}
                    </span>
                  )}
                </div>
              )}
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