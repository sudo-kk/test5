import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export type CartItem = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    stock: number;
  };
  total: number;
};

type CartContextType = {
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Only fetch cart if user is logged in
  const {
    data: cartItems = [],
    error,
    isLoading,
    refetch,
  } = useQuery<CartItem[], Error>({
    queryKey: ["/api/cart"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Calculate cart totals whenever cart items change
  useEffect(() => {
    setCartTotal(cartItems.reduce((sum, item) => sum + item.total, 0));
    setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
  }, [cartItems]);

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (!user) {
        throw new Error("Please login to add items to cart");
      }
      await apiRequest("POST", "/api/cart", { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (!user) {
        throw new Error("Please login to update your cart");
      }
      await apiRequest("PUT", `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!user) {
        throw new Error("Please login to remove items from cart");
      }
      await apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove from cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = async (productId: number, quantity: number) => {
    await addToCartMutation.mutateAsync({ productId, quantity });
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    await updateQuantityMutation.mutateAsync({ productId, quantity });
  };

  const removeFromCart = async (productId: number) => {
    await removeFromCartMutation.mutateAsync(productId);
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      // Clear cart items one by one
      for (const item of cartItems) {
        await apiRequest("DELETE", `/api/cart/${item.productId}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    } catch (error) {
      toast({
        title: "Failed to clear cart",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

function getQueryFn({ on401 }: { on401: "returnNull" | "throw" }) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });

      if (on401 === "returnNull" && res.status === 401) {
        return [];
      }

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      if (on401 === "returnNull") {
        return [];
      }
      throw error;
    }
  };
}
