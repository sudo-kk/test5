import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container-custom relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 md:py-24 items-center">
          {/* Left Content */}
          <div className="order-2 md:order-1 z-10">
            <h1 className="font-bold text-gray-900 mb-6">
              <span className="block mb-2">Elevate Your Style</span>
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Summer Collection 2025
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Discover our latest arrivals with up to 40% off on selected items. 
              Elegant designs to enhance your personal style.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/categories/clothing">
                <Button size="lg" className="rounded-full px-6 shadow-md">
                  Shop Now
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/categories/watches">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full border-gray-300 text-gray-700 px-6"
                >
                  Explore Watches
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right Content - Image */}
          <div className="order-1 md:order-2 relative h-full md:h-auto">
            <div className="rounded-xl overflow-hidden bg-white shadow-xl max-w-md mx-auto">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Summer collection showcase"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary/10 rounded-full hidden md:block"></div>
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-blue-600/10 rounded-full hidden md:block"></div>
          </div>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { number: "1200+", label: "Products" },
              { number: "20k+", label: "Happy Customers" },
              { number: "15+", label: "Brand Partners" },
              { number: "24/7", label: "Customer Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-primary mb-1">{stat.number}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
