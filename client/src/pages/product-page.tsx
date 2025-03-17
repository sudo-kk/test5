import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Product } from "@shared/schema";
import { Loader2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const productId = parseInt(id);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !isNaN(productId),
  });

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity);
    } catch (error) {
      toast({
        title: "Error adding to cart",
        description: error instanceof Error ? error.message : "Please log in to add items to your cart",
        variant: "destructive",
      });
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-grow flex justify-center items-center flex-col">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600">Sorry, the product you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Product image */}
          <div className="flex flex-col">
            <div className="w-full aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-center object-cover"
              />
            </div>
          </div>

          {/* Product details */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
            
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900">₹{product.price.toFixed(2)}</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                  </Badge>
                </div>
              </div>
            </div>

            {product.color && product.material && (
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="flex space-x-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900">Color</h4>
                    <p className="mt-1 text-gray-500">{product.color}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Material</h4>
                    <p className="mt-1 text-gray-500">{product.material}</p>
                  </div>
                </div>
                <Separator className="my-4" />
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-gray-900 mr-4">Quantity</h3>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={product.stock <= quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
