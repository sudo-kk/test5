import { useQuery, useMutation } from "@tanstack/react-query";
import AdminSidebar from "@/components/layout/admin-sidebar";
import OrderList from "@/components/admin/order-list";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Order = {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
};

export default function AdminOrders() {
  const { toast } = useToast();

  const { 
    data: orders = [], 
    isLoading
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const renderStatusCell = (order: Order) => {
    const statusOptions = ["pending", "processing", "shipped", "completed", "cancelled"];
    
    return (
      <Select
        defaultValue={order.status}
        onValueChange={(value) => handleStatusChange(order.id, value)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <AdminSidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <div className="mt-8">
                  <OrderList 
                    orders={orders} 
                    renderStatusCell={renderStatusCell} 
                    isAdmin={true}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
