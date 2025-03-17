import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function CartPage() {
  const { cartItems, isLoading, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { user } = useAuth();

  if (isLoading) {
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
      <main className="flex-grow py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Shopping Cart</h1>
          
          {cartItems.length === 0 ? (
            <div className="mt-12 text-center py-16 bg-white rounded-lg shadow-sm">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-sm text-gray-500">
                Looks like you haven't added any products to your cart yet.
              </p>
              <div className="mt-6">
                <Link href="/">
                  <Button>
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
              <section aria-labelledby="cart-heading" className="lg:col-span-7">
                <h2 id="cart-heading" className="sr-only">
                  Items in your shopping cart
                </h2>

                <ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-6 flex">
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-center object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link href={`/products/${item.product.id}`}>
                                <a className="hover:text-primary">{item.product.name}</a>
                              </Link>
                            </h3>
                            <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            ${item.product.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <div className="flex items-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              className="w-16 mx-2 text-center"
                              type="number"
                              min="1"
                              max={item.product.stock}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1 && val <= item.product.stock) {
                                  updateQuantity(item.productId, val);
                                }
                              }}
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => updateQuantity(item.productId, Math.min(item.product.stock, item.quantity + 1))}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Order summary */}
              <section
                aria-labelledby="summary-heading"
                className="mt-16 bg-white rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5"
              >
                <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                  Order summary
                </h2>

                <dl className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">${cartTotal.toFixed(2)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Shipping</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {cartTotal >= 100 ? 'Free' : '$10.00'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Tax</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ${(cartTotal * 0.1).toFixed(2)}
                    </dd>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                    <dd className="text-base font-medium text-gray-900">
                      ${(cartTotal + (cartTotal >= 100 ? 0 : 10) + cartTotal * 0.1).toFixed(2)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  {user ? (
                    <Link href="/checkout">
                      <Button className="w-full">
                        Checkout <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <div>
                      <Link href="/auth">
                        <Button className="w-full mb-3">
                          Sign in to Checkout
                        </Button>
                      </Link>
                      <p className="text-sm text-gray-500 text-center">
                        Please sign in or create an account to continue to checkout
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
