
import React from 'react';
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
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Cart = ({ open, onOpenChange }: CartProps) => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();
  const { toast } = useToast();

  const handleCheckout = () => {
    toast({
      title: "Order Placed!",
      description: `Your order of ${getTotalItems()} items has been placed successfully.`,
    });
    clearCart();
    onOpenChange(false);
  };

  return (
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
  );
};

export default Cart;
