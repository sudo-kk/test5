import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "@/components/layout/admin-sidebar";
import StatsCard from "@/components/admin/stats-card";
import OrderList from "@/components/admin/order-list";
import { Loader2 } from "lucide-react";
import { ShoppingBag, Users, Box, DollarSign } from "lucide-react";

type AdminStats = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: any[];
};

export default function AdminDashboard() {
  const { 
    data: stats,
    isLoading
  } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <AdminSidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : stats ? (
                <>
                  {/* Dashboard Stats */}
                  <div className="mt-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <StatsCard 
                        title="Total Sales" 
                        value={`$${stats.totalSales.toFixed(2)}`} 
                        icon={<DollarSign className="text-white" />} 
                        linkText="View all sales" 
                        linkUrl="/admin/sales" 
                      />
                      <StatsCard 
                        title="Total Customers" 
                        value={stats.totalCustomers.toString()} 
                        icon={<Users className="text-white" />} 
                        linkText="View all customers" 
                        linkUrl="/admin/customers" 
                      />
                      <StatsCard 
                        title="Total Orders" 
                        value={stats.totalOrders.toString()} 
                        icon={<ShoppingBag className="text-white" />} 
                        linkText="View all orders" 
                        linkUrl="/admin/orders" 
                      />
                      <StatsCard 
                        title="Total Products" 
                        value={stats.totalProducts.toString()} 
                        icon={<Box className="text-white" />} 
                        linkText="View all products" 
                        linkUrl="/admin/products" 
                      />
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <h2 className="mt-8 text-lg font-medium text-gray-900">Recent Orders</h2>
                  <OrderList orders={stats.recentOrders} />
                </>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Could not load dashboard statistics. Please try again later.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
