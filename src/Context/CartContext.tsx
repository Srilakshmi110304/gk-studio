// context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem extends Product {
  quantity: number;
  selectedVariant: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart whenever user changes
  useEffect(() => {
    loadCart();
  }, [user]);

  // ✅ LOAD USER CART FROM SUPABASE
  const loadCart = async () => {
    setLoading(true);

    try {
      if (!user) {
        setCartItems([]);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const items: CartItem[] = (data || []).map((item: any) => ({
        id: item.product_id,
        name: item.product_name,
        category: '',
        subCategory: '',
        collection: '',
        occasion: [],
        price: item.price,
        offerPrice: item.price,
        offerPercent: 0,
        images: [item.product_image],
        rating: 0,
        reviewCount: 0,
        inStock: true,
        variants: [item.variant],
        material: '',
        weight: '',
        description: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        quantity: item.quantity,
        selectedVariant: item.variant
      }));

      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD TO CART - Direct to Supabase
  const addToCart = async (product: Product, quantity: number = 1, variant?: string) => {
    if (!user) {
      alert("Please login to add to cart");
      return;
    }

    const selectedVariant = variant || product.variants?.[0] || 'default';

    try {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .eq('variant', selectedVariant)
        .maybeSingle();

      if (existing) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        // Insert new item
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          product_image: product.images[0],
          price: product.offerPrice,
          quantity,
          variant: selectedVariant
        });
      }

      await loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // ✅ REMOVE FROM CART
  const removeFromCart = async (productId: string) => {
    if (!user) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    await loadCart();
  };

  // ✅ UPDATE QUANTITY
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    await loadCart();
  };

  // ✅ CLEAR CART
  const clearCart = async () => {
    if (!user) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    setCartItems([]);
  };

  const getCartCount = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const getCartTotal = () => cartItems.reduce((sum, item) => sum + item.offerPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};