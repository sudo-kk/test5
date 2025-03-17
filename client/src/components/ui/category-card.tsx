import { Link } from "wouter";
import { Category } from "@shared/schema";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  index: number;
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  // Get image URL based on category slug
  const getImageUrl = (slug: string) => {
    switch (slug) {
      case "watches":
        return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1399&q=80";
      case "clothing":
        return "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80";
      case "shoes":
        return "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80";
      default:
        return "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
    }
  };

  const imageUrl = getImageUrl(category.slug);
  
  // Determine if this is the featured category (first one)
  const isFeatured = index === 0;

  return (
    <Link href={`/categories/${category.slug}`}>
      <div className={`card-hover cursor-pointer group relative rounded-xl overflow-hidden 
        ${isFeatured ? 'aspect-square md:row-span-2' : 'aspect-[4/3]'}`}>
        
        {/* Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={imageUrl}
            alt={`${category.name} collection`}
            className="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
          <h3 className={`font-semibold mb-2 transition-transform duration-300 group-hover:translate-x-2 
            ${isFeatured ? 'text-2xl' : 'text-xl'}`}>
            {category.name}
          </h3>
          
          <div className="flex items-center text-sm font-medium opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2">
            <span className="mr-2">Shop Collection</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
          
          {/* Accent border */}
          <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary transition-all duration-300 group-hover:w-full"></div>
        </div>
      </div>
    </Link>
  );
}
