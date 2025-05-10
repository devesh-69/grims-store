
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";

// Import pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminFeaturesPage from "./pages/AdminFeaturesPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminLogsPage from "./pages/AdminLogsPage";
import AdminEmailTemplatesPage from "./pages/AdminEmailTemplatesPage";
import AdminApiKeysPage from "./pages/AdminApiKeysPage";
import MaintenancePage from "./pages/MaintenancePage";
import AdminBlogPostsPage from "./pages/AdminBlogPostsPage";

// Create a client
const queryClient = new QueryClient();

const MaintenanceWrapper = ({ children }: { children: React.ReactNode }) => {
  const { getSetting } = useSystemSettings();
  const maintenanceMode = getSetting<boolean>("maintenanceMode", false);
  
  // Allow access to admin pages even in maintenance mode
  const path = window.location.pathname;
  const isAdminPath = path.startsWith("/admin");
  
  if (maintenanceMode && !isAdminPath) {
    return <MaintenancePage />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MaintenanceWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/features" element={<AdminFeaturesPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/logs" element={<AdminLogsPage />} />
            <Route path="/admin/email-templates" element={<AdminEmailTemplatesPage />} />
            <Route path="/admin/api-keys" element={<AdminApiKeysPage />} />
            <Route path="/admin/blog-posts" element={<AdminBlogPostsPage />} />
          </Routes>
        </MaintenanceWrapper>
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
