import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logoutMutation } = useAuth();
  const { cartCount } = useCart();
  const [location, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search for:", searchQuery);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-2xl font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent cursor-pointer">
                StyleHub
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {[
                { href: "/", label: "Home" },
                { href: "/categories/watches", label: "Watches" },
                { href: "/categories/clothing", label: "Clothing" },
                { href: "/categories/shoes", label: "Shoes" }
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className={`${
                    location === item.href 
                      ? "text-primary font-medium" 
                      : "text-gray-600 hover:text-gray-900"
                  } py-2 text-sm transition-colors duration-200`}>
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative w-full max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 h-9 rounded-full border-gray-200 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-gray-100"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {cartCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-0 h-8 w-8 overflow-hidden border border-gray-200"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-900 border-b border-gray-100">
                    {user.username}
                  </div>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate("/admin")}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="rounded-full px-4">Sign In</Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Link href="/cart" className="mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {cartCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-full"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pt-6">
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <span className="text-2xl font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        StyleHub
                      </span>
                    </Link>
                  </div>
                  
                  <div className="mb-6">
                    <form onSubmit={handleSearch} className="flex">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          type="search"
                          placeholder="Search products..."
                          className="pl-10 w-full rounded-l-md"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="rounded-l-none">
                        Search
                      </Button>
                    </form>
                  </div>
                  
                  <div className="space-y-1">
                    {[
                      { href: "/", label: "Home" },
                      { href: "/categories/watches", label: "Watches" },
                      { href: "/categories/clothing", label: "Clothing" },
                      { href: "/categories/shoes", label: "Shoes" }
                    ].map((item) => (
                      <Link key={item.href} href={item.href}>
                        <a
                          className={`${
                            location === item.href
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          } block px-3 py-2 rounded-md text-base transition-colors duration-200`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </a>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-gray-200">
                    {user ? (
                      <>
                        <div className="flex items-center px-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                            </div>
                            {user.email && (
                              <div className="text-xs text-gray-500">
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Link href="/profile">
                            <a
                              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <User className="mr-3 h-4 w-4" />
                              Your Profile
                            </a>
                          </Link>
                          <Link href="/orders">
                            <a
                              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Package className="mr-3 h-4 w-4" />
                              Your Orders
                            </a>
                          </Link>
                          {user.isAdmin && (
                            <Link href="/admin">
                              <a
                                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                Admin Dashboard
                              </a>
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </>
                    ) : (
                      <Link href="/auth">
                        <Button 
                          className="w-full" 
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign in
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}