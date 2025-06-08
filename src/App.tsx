
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminAddProductPage from "./pages/AdminAddProductPage";
import AdminEditProductPage from "./pages/AdminEditProductPage";
import AdminBlogPostsPage from "./pages/AdminBlogPostsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import ReportDetailsPage from "./pages/ReportDetailsPage";
import CreateReportPage from "./pages/CreateReportPage";
import ScheduledReportsPage from "./pages/ScheduledReportsPage";
import WishlistPage from "./pages/WishlistPage";
import ImportWishlistPage from "./pages/ImportWishlistPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminSecurityPage from "./pages/AdminSecurityPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } />
             <Route path="/wishlist/import/:shareId" element={
              <ProtectedRoute>
                <ImportWishlistPage />
              </ProtectedRoute>
            } />
            {/* Admin routes - redirect /admin to /admin/dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute>
                <AdminProductsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/products/add" element={
              <ProtectedRoute>
                <AdminAddProductPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/products/edit/:id" element={
              <ProtectedRoute>
                <AdminEditProductPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/blog-posts" element={
              <ProtectedRoute>
                <AdminBlogPostsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute>
                <AdminReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports/:id" element={
              <ProtectedRoute>
                <ReportDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports/create" element={
              <ProtectedRoute>
                <CreateReportPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/scheduled-reports" element={
              <ProtectedRoute>
                <ScheduledReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/security" element={
              <ProtectedRoute>
                <AdminSecurityPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
