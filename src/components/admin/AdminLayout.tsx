
import { ReactNode } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut, user } = useAuth();
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      <AdminNav />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 shrink-0">
          <div className="flex h-full items-center justify-between px-4">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
