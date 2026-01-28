
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MenuItem } from '@/components/MenuCategory';
import * as cartApi from '@/services/api/cart';
import { getAccessToken } from '@/services/api/config';

export interface CartItem extends MenuItem {
  id?: string;
  quantity: number;
  cartItemId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const isAuthenticated = () => !!getAccessToken();

  // Fetch cart from API
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated()) return;

    setIsLoading(true);
    try {
      const response = await cartApi.getCart();
      const cartItems: CartItem[] = response.cart.items.map((item) => ({
        id: item.menuItemId,
        cartItemId: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.unitPrice,
        quantity: item.quantity,
      }));
      setItems(cartItems);
      setSubtotal(response.cart.subtotal);
      setDeliveryFee(response.cart.deliveryFee);
      setTax(response.cart.tax);
      setTotal(response.cart.total);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      refreshCart();
    }
  }, [refreshCart]);

  const addToCart = async (item: MenuItem) => {
    if (isAuthenticated() && item.id) {
      setIsLoading(true);
      try {
        await cartApi.addToCart({
          menuItemId: item.id,
          quantity: 1,
        });
        await refreshCart();
      } catch (error) {
        console.error('Failed to add to cart:', error);
        // Fallback to local cart
        addToLocalCart(item);
      } finally {
        setIsLoading(false);
      }
    } else {
      addToLocalCart(item);
    }
  };

  const addToLocalCart = (item: MenuItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.name === item.name
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = async (itemName: string) => {
    const item = items.find((i) => i.name === itemName);

    if (isAuthenticated() && item?.cartItemId) {
      setIsLoading(true);
      try {
        await cartApi.removeFromCart(item.cartItemId);
        await refreshCart();
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        setItems((prevItems) => prevItems.filter((item) => item.name !== itemName));
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.name !== itemName));
    }
  };

  const updateQuantity = async (itemName: string, quantity: number) => {
    const item = items.find((i) => i.name === itemName);

    if (isAuthenticated() && item?.cartItemId) {
      setIsLoading(true);
      try {
        await cartApi.updateCartItem(item.cartItemId, { quantity });
        await refreshCart();
      } catch (error) {
        console.error('Failed to update cart:', error);
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.name === itemName ? { ...item, quantity } : item
          )
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.name === itemName ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated()) {
      setIsLoading(true);
      try {
        await cartApi.clearCart();
        setItems([]);
        setSubtotal(0);
        setDeliveryFee(0);
        setTax(0);
        setTotal(0);
      } catch (error) {
        console.error('Failed to clear cart:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems([]);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    if (isAuthenticated() && total > 0) {
      return total;
    }
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isLoading,
        refreshCart,
        subtotal: subtotal || items.reduce((t, i) => t + i.price * i.quantity, 0),
        deliveryFee,
        tax: tax || items.reduce((t, i) => t + i.price * i.quantity, 0) * 0.08,
        total: total || items.reduce((t, i) => t + i.price * i.quantity, 0) * 1.08,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
