import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/ui/hero-section";
import ProductCard from "@/components/ui/product-card";
import CategoryCard from "@/components/ui/category-card";
import { Product, Category } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { 
    data: products = [], 
    isLoading: productsLoading 
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="bg-slate-50">
      <HeroSection />

      {/* Featured Categories */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-baseline sm:justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Shop by Category</h2>
            <a href="#" className="hidden text-sm font-semibold text-primary hover:text-blue-500 sm:block">
              Browse all categories<span aria-hidden="true"> &rarr;</span>
            </a>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <a href="#" className="block text-sm font-semibold text-primary hover:text-blue-500">
              Browse all categories<span aria-hidden="true"> &rarr;</span>
            </a>
          </div>
        </div>
      </div>

      {/* Product Listing */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-baseline sm:justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Trending Products</h2>
            <a href="#" className="hidden text-sm font-semibold text-primary hover:text-blue-500 sm:block">
              See all products<span aria-hidden="true"> &rarr;</span>
            </a>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-6 sm:hidden">
            <a href="#" className="block text-sm font-semibold text-primary hover:text-blue-500">
              See all products<span aria-hidden="true"> &rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
