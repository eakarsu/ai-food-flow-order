
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Minus, Plus, ShoppingBag, Trash2, CreditCard, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface CartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PaymentMethod = 'credit-card' | 'paypal' | 'apple';

const Cart = ({ open, onOpenChange }: CartProps) => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleCheckout = () => {
    if (items.length > 0) {
      setShowPaymentDialog(true);
    } else {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checkout.",
      });
    }
  };

  const processPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      
      // Show success state for 1.5 seconds then complete the order
      setTimeout(() => {
        completeOrder();
      }, 1500);
    }, 2000);
  };
  
  const completeOrder = () => {
    toast({
      title: "Order Placed!",
      description: `Your order of ${getTotalItems()} items has been placed successfully and will be delivered soon.`,
    });
    clearCart();
    setShowPaymentDialog(false);
    setPaymentComplete(false);
    onOpenChange(false);
  };

  const PaymentMethodButton = ({ type, label }: { type: PaymentMethod, label: string }) => (
    <Button
      variant={paymentMethod === type ? "default" : "outline"}
      className={`flex items-center justify-start gap-2 w-full ${paymentMethod === type ? 'bg-green-500 hover:bg-green-600' : ''}`}
      onClick={() => setPaymentMethod(type)}
    >
      {type === 'credit-card' && <CreditCard size={18} />}
      {type === 'paypal' && <span className="text-lg font-bold text-blue-500">P</span>}
      {type === 'apple' && <span className="text-lg">🍎</span>}
      {label}
      {paymentMethod === type && (
        <Check size={16} className="ml-auto" />
      )}
    </Button>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <ShoppingBag className="mr-2" />
              Your Cart ({getTotalItems()} items)
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh]">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <SheetClose asChild>
                <Button variant="outline" className="mt-4">
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          ) : (
            <>
              <div className="py-4 flex-1 overflow-auto">
                {items.map((item) => (
                  <div 
                    key={item.name} 
                    className="flex justify-between items-center py-4 border-b"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => {
                          if (item.quantity === 1) {
                            removeFromCart(item.name);
                          } else {
                            updateQuantity(item.name, item.quantity - 1);
                          }
                        }}
                      >
                        <Minus size={14} />
                      </Button>
                      
                      <span className="w-8 text-center">{item.quantity}</span>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.name, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 ml-2"
                        onClick={() => removeFromCart(item.name)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <SheetFooter className="border-t pt-4">
                <div className="w-full space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleCheckout} className="bg-food-primary hover:bg-food-primary/90">
                      Checkout (${getTotalPrice().toFixed(2)})
                    </Button>
                    
                    <Button variant="outline" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Select your preferred payment method to complete your purchase.
            </DialogDescription>
          </DialogHeader>
          
          {!paymentComplete ? (
            <>
              <div className="space-y-3 py-4">
                <PaymentMethodButton type="credit-card" label="Credit Card" />
                <PaymentMethodButton type="paypal" label="PayPal" />
                <PaymentMethodButton type="apple" label="Apple Pay" />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Total Amount:</span>
                  <span className="font-bold">${getTotalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  By proceeding, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isProcessing ? 'Processing...' : `Pay $${getTotalPrice().toFixed(2)}`}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Payment Successful!</h3>
              <p className="text-center text-gray-500 mb-4">
                Your order has been placed successfully.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;

