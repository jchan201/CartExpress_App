import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function Breadcrumbs() {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Format the label
      let label = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Replace common path segments with better labels
      if (path === "products" && index === 0) {
        label = "Products";
      } else if (paths[index - 1] === "products" && index > 0) {
        // For product detail pages, we'll just show "Product Details"
        // In a real app, you'd fetch the product name
        label = "Product Details";
      } else if (path === "cart") {
        label = "Shopping Cart";
      } else if (path === "checkout") {
        label = "Checkout";
      } else if (path === "wishlist") {
        label = "Wishlist";
      } else if (path === "admin") {
        label = "Admin Dashboard";
      } else if (path === "profile") {
        label = "My Profile";
      }

      // Don't add path for the last item (current page)
      breadcrumbs.push({
        label,
        path: index === paths.length - 1 ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 py-3 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1 text-gray-900 font-medium">
                  {index === 0 && <Home className="w-4 h-4" />}
                  <span>{crumb.label}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
