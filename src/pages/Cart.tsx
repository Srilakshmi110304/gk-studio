// pages/Cart.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../Context/CartContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const subtotal = getCartTotal();
  const delivery = subtotal > 499 ? 0 : 99;
  const total = subtotal + delivery;

  if (loading) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded max-w-md mx-auto"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-page-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-text-secondary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-primary mb-4">Your Cart is Empty</h1>
          <p className="text-text-secondary mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <h1 className="text-3xl font-heading font-bold text-primary mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.selectedVariant}`} className="bg-white p-6 rounded-card shadow-sm border border-gray-100 flex gap-6">
              <div className="w-24 h-32 rounded-md overflow-hidden shrink-0">
                <img 
                  src={item.images?.[0] || 'https://via.placeholder.com/100x150?text=No+Image'} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-primary">{item.name}</h3>
                    <p className="text-xs text-text-secondary uppercase tracking-widest mt-1">
                      {item.collection} | {item.selectedVariant}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-text-secondary hover:text-sale transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="mt-auto flex justify-between items-end">
                  <div className="flex items-center border border-gray-200 rounded-btn">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-page-bg"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 font-bold min-w-[40px] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-page-bg"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatPrice(item.offerPrice * item.quantity)}</p>
                    {item.price > item.offerPrice && (
                      <p className="text-xs text-text-secondary line-through">{formatPrice(item.price)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white p-6 rounded-card shadow-sm border border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary mb-4">Apply Coupon</h4>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Enter coupon code" 
                className="flex-grow bg-page-bg border-none rounded-btn px-4 py-3 text-sm focus:ring-accent"
              />
              <button className="btn-secondary px-8">Apply</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-card shadow-card sticky top-32">
            <h3 className="font-heading text-2xl font-bold text-primary mb-6">Order Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Delivery</span>
                <span className="font-bold text-green-600">{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between text-xl">
                <span className="font-heading font-bold text-primary">Total</span>
                <span className="font-heading font-bold text-accent">{formatPrice(total)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>
            <p className="text-[10px] text-text-secondary text-center mt-6 uppercase tracking-widest">
              Secure Checkout | 100% Authentic Products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;