import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-12 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Link href="/">
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent cursor-pointer">
                StyleHub
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 max-w-md">
              Curating elegant styles for the modern lifestyle. Quality fashion that stands the test of time.
            </p>
            <div className="mt-6 flex space-x-4">
              {[
                { icon: <Facebook className="h-5 w-5" />, label: "Facebook" },
                { icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
                { icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                { icon: <Youtube className="h-5 w-5" />, label: "YouTube" }
              ].map((social, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="text-gray-400 hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/categories/watches", label: "Watches" },
                { href: "/categories/clothing", label: "Clothing" },
                { href: "/categories/shoes", label: "Shoes" },
                { href: "/new-arrivals", label: "New Arrivals" },
                { href: "/sale", label: "Sale" }
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-sm text-gray-500 hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/blog", label: "Blog" },
                { href: "/careers", label: "Careers" },
                { href: "/contact", label: "Contact Us" },
                { href: "/sustainability", label: "Sustainability" }
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-sm text-gray-500 hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <span className="text-sm text-gray-500">
                  123 Fashion Street<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-500">+1 (888) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <a href="mailto:info@stylehub.com" className="text-sm text-gray-500 hover:text-primary">
                  info@stylehub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {year} StyleHub, Inc. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-x-8 gap-y-2">
              {[
                { href: "/terms", label: "Terms" },
                { href: "/privacy", label: "Privacy" },
                { href: "/cookies", label: "Cookies" },
                { href: "/accessibility", label: "Accessibility" }
              ].map((link, index) => (
                <Link key={index} href={link.href}>
                  <a className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
