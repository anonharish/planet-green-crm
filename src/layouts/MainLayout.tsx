import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Briefcase 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export const MainLayout = () => {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Manage Leads', path: '/leads', icon: <Briefcase size={20} /> },
    { label: 'Manage Users', path: '/users', icon: <Users size={20} /> },
    { label: 'Manage Agents', path: '/agents', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white min-h-screen hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Planet Green</h2>
          <p className="text-zinc-400 text-sm mt-1">CRM Platform</p>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6">
          <div className="md:hidden">
            <h2 className="text-xl font-bold tracking-tight">Planet Green</h2>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-zinc-200">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-900">
                    AD
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-50 dark:bg-zinc-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
