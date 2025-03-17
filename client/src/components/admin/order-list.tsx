import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderListProps {
  orders: Order[];
  renderStatusCell?: (order: Order) => React.ReactNode;
  isAdmin?: boolean;
}

export default function OrderList({ orders, renderStatusCell, isAdmin = false }: OrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(date);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            {isAdmin && <TableHead>Customer</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.id.toString().padStart(4, '0')}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    User #{order.userId}
                  </TableCell>
                )}
                <TableCell>
                  {renderStatusCell ? renderStatusCell(order) : getStatusBadge(order.status)}
                </TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          Order #{selectedOrder?.id.toString().padStart(4, '0')}
                        </DialogTitle>
                      </DialogHeader>

                      {selectedOrder && (
                        <div className="mt-4">
                          <div className="flex justify-between mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date</p>
                              <p>{formatDate(selectedOrder.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Status</p>
                              <p>{getStatusBadge(selectedOrder.status)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Total</p>
                              <p className="font-semibold">${selectedOrder.total.toFixed(2)}</p>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold mb-2">Items</h3>
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-16">Image</TableHead>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Subtotal</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedOrder.items.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                                        <img
                                          src={item.product.imageUrl}
                                          alt={item.product.name}
                                          className="w-full h-full object-center object-cover"
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell>{item.product.name}</TableCell>
                                    <TableCell>${item.price.toFixed(2)}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
