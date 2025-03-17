import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import ProductCard from "@/components/ui/product-card";
import { Product, Category } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [`/api/categories/${slug}/products`],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const category = categories.find(cat => cat.slug === slug);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="flex-grow flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-grow">
        {/* Category Header */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                {category ? category.name : slug}
              </h1>
              <p className="mt-4 max-w-xl mx-auto text-base text-gray-500">
                Explore our collection of {category ? category.name.toLowerCase() : slug} and find your perfect style.
              </p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-medium text-gray-900">No products found</h2>
                <p className="mt-4 text-gray-500">
                  We couldn't find any products in this category. Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
