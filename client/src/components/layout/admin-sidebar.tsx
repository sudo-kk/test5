import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart,
  Settings,
  Tag,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}

function NavLink({ href, icon, children, active, onClick }: NavLinkProps) {
  return (
    <Link href={href}>
      <a
        className={`${
          active
            ? "bg-slate-900 text-white"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
        onClick={onClick}
      >
        {icon}
        {children}
      </a>
    </Link>
  );
}

export default function AdminSidebar() {
  const [location] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    return null;
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="mr-3 h-5 w-5 text-primary" />,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: <Package className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-300" />,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: <Tag className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-300" />,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: <ShoppingCart className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-300" />,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: <Users className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-300" />,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-300" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-300" />,
    },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div className="fixed inset-0 flex z-40 md:hidden">
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px] bg-slate-800">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-slate-800">
                <span className="text-xl font-bold text-white">StyleHub Admin</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-1 h-0 overflow-y-auto">
                <nav className="px-2 py-4 space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      href={item.href}
                      icon={item.icon}
                      active={location === item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-slate-800">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-800">
            <span className="text-xl font-bold text-white">StyleHub Admin</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  href={item.href}
                  icon={item.icon}
                  active={location === item.href}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile nav toggle */}
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
          className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex">
            <span className="flex items-center text-xl font-semibold">
              Admin Dashboard
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
