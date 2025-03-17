import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error adding to cart",
        description: error instanceof Error ? error.message : "Please log in to add items to your cart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="group relative card-hover rounded-lg overflow-hidden bg-white">
      <Link href={`/products/${product.id}`}>
        <div className="cursor-pointer h-full flex flex-col">
          <div className="relative">
            {/* Product image */}
            <div className="aspect-[3/4] overflow-hidden bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-center object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            
            {/* Hover overlay with view details button */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button 
                variant="secondary" 
                size="sm" 
                className="rounded-full px-4 bg-white/90 hover:bg-white shadow-md"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>
            
            {/* Stock indicator */}
            {product.stock <= 0 && (
              <div className="absolute top-2 left-2 bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">
                Out of Stock
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div className="p-4 flex-grow flex flex-col">
            <div className="flex-grow">
              <h3 className="text-base font-medium text-gray-800 mb-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                {product.color && product.material ? 
                  `${product.color} / ${product.material}` : 
                  product.color || product.material || ""}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-lg font-semibold text-gray-900">
                ₹{product.price.toFixed(2)}
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
