import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_dummy");

function CheckoutForm({ totalAmount }: { totalAmount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in the backend
        await apiRequest("POST", "/api/orders", {
          total: totalAmount,
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        });

        // Clear the cart
        await clearCart();

        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });

        // Navigate to home page or order confirmation
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${totalAmount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const { cartItems, cartTotal } = useCart();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  
  // Calculate total including shipping and tax
  const shippingCost = cartTotal >= 100 ? 0 : 10;
  const tax = cartTotal * 0.1;
  const totalAmount = cartTotal + shippingCost + tax;

  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { amount: totalAmount })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setPaymentStatus('ready');
      })
      .catch(error => {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Payment Setup Failed",
          description: error instanceof Error ? error.message : "Could not initialize payment",
          variant: "destructive",
        });
        setPaymentStatus('error');
      });
  }, [cartItems, totalAmount, toast]);

  // Check for successful payment return
  useEffect(() => {
    // Only check URL parameters on component mount
    if (window.location.search.includes('payment_intent_client_secret')) {
      const searchParams = new URLSearchParams(window.location.search);
      const clientSecret = searchParams.get('payment_intent_client_secret');
      const paymentIntentId = searchParams.get('payment_intent');
      
      if (clientSecret && paymentIntentId) {
        setPaymentStatus('success');
        // Process order completion logic here
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-grow py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Checkout</h1>
            <p className="mt-4 text-gray-500">Secure payment processing</p>
          </div>

          {paymentStatus === 'success' ? (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mr-4" />
                  <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-green-700">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </Button>
              </CardFooter>
            </Card>
          ) : paymentStatus === 'error' ? (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <div className="flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mr-4" />
                  <CardTitle className="text-2xl text-red-800">Payment Failed</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-red-700">
                  There was an error processing your payment. Please try again.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:gap-x-16">
              {/* Order Summary */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex">
                            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-center object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Subtotal</p>
                        <p className="font-medium">${cartTotal.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Shipping</p>
                        <p className="font-medium">
                          {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Free'}
                        </p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p className="text-gray-500">Tax</p>
                        <p className="font-medium">${tax.toFixed(2)}</p>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900">Total</p>
                        <p className="font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Payment Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentStatus === 'loading' || !clientSecret ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Elements 
                        stripe={stripePromise} 
                        options={{ clientSecret }}
                      >
                        <CheckoutForm totalAmount={totalAmount} />
                      </Elements>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
