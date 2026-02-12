import { Outlet } from "react-router";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Toaster } from "sonner";

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Breadcrumbs />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}