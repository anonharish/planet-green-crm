import React, { useState } from "react";
import {
  Outlet,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  Users,
  UserCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
} from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../config/permissions";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { cn } from "../utils";

export const MainLayout = () => {
  const { isAuthenticated, isFirstLogin, user, logout } = useAuth();
  const { can } = usePermissions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isFirstLogin) {
    return <Navigate to="/set-password" replace />;
  }

  const allNavItems = [
    // {
    //   label: "Dashboard",
    //   path: "/dashboard",
    //   icon: <LayoutDashboard size={22} />,
    // },
    { label: "Manage Leads", path: "/leads", icon: <Briefcase size={22} /> },
    {
      label: "Customers",
      path: "/customers",
      icon: <Users size={22} />,
      permission: PERMISSIONS.CUSTOMER_VIEW,
    },
    {
      label: "Relationship Managers",
      path: "/relationship-managers",
      icon: <Users size={22} />,
      permission: PERMISSIONS.MANAGER_VIEW,
    },
    {
      label: "Experience Managers",
      path: "/agents",
      icon: <UserCircle size={22} />,
      permission: PERMISSIONS.AGENT_VIEW,
    },
    {
      label: "UI Playground",
      path: "/playground",
      icon: <FlaskConical size={22} />,
      permission: PERMISSIONS.MANAGER_VIEW,
    },
  ];

  const navItems = allNavItems.filter(
    (item) => !item.permission || can(item.permission),
  );

  const getInitials = () => {
    if (!user) return "??";
    if (user.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white/80 dark:bg-white/80 backdrop-blur-md border-r border-border min-h-screen hidden md:flex flex-col transition-all duration-300 relative",
          isSidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-5 bg-white rounded-full p-1 border border-border text-primary hover:bg-accent transition-colors z-10 shadow-sm"
        >
          {isSidebarOpen ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        <div
          className={cn(
            "p-6 flex flex-col justify-center h-20 whitespace-nowrap overflow-hidden transition-all duration-300",
            isSidebarOpen ? "items-start" : "items-center",
          )}
        >
          {isSidebarOpen ? (
            <div className="flex flex-col opacity-100">
              <h2 className="text-2xl font-bold text-primary tracking-tight leading-none">
                Planet Green
              </h2>
            </div>
          ) : (
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white shrink-0">
              PG
            </div>
          )}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isSidebarOpen ? item.label : undefined}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-accent/40 text-primary font-bold"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-primary",
                  isSidebarOpen ? "space-x-4" : "justify-center px-0",
                )}
              >
                <div
                  className={cn(
                    "shrink-0 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                  )}
                >
                  {item.icon}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-sm overflow-hidden transition-all duration-300",
                    isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-0 shadow-sm">
          <div className="md:hidden">
            <h2 className="text-xl font-bold tracking-tight">Planet Green</h2>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-zinc-100 uppercase">
                    {getInitials()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-100">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-zinc-500">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer p-3 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  onClick={() => navigate("/update-password")}
                >
                  <UserCircle className="mr-2 h-4 w-4 text-zinc-500" />
                  <span className="font-medium text-sm">Update Password</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer p-3 focus:bg-zinc-100 dark:focus:bg-zinc-800"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4 text-zinc-500" />
                  <span className="font-medium text-sm">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background dark:bg-background p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
