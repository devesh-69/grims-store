
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LineChart,
  FileText,
  ShoppingBag,
  Users,
  Settings,
  LayoutDashboard,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: "Blog Posts",
      path: "/admin/blog-posts",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      path: "/admin/reports",
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      name: "Scheduled Reports",
      path: "/admin/scheduled-reports",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        "h-full bg-background/95 pt-4 border-r border-border relative transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="px-3 py-2">
          <div
            className={cn(
              "flex items-center h-10",
              isCollapsed ? "justify-center" : "px-2"
            )}
          >
            {!isCollapsed && (
              <Link to="/admin" className="font-semibold text-lg text-foreground">
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.exact && location.pathname === link.path
                  ? true
                  : !link.exact && isActivePath(link.path);

              return (
                <Button
                  key={link.path}
                  variant={isActive ? "secondary" : "ghost"}
                  asChild
                  className={cn(
                    "w-full justify-start",
                    isCollapsed ? "justify-center px-0" : "px-3",
                    isActive 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Link to={link.path}>
                    <span
                      className={cn(
                        "h-5 w-5",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {link.icon}
                    </span>
                    {!isCollapsed && <span className="ml-3">{link.name}</span>}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full flex justify-center text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminNav;
