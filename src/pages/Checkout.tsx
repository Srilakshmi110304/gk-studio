// pages/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { ChevronRight, MapPin, Truck, CreditCard, CheckCircle2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { useOrders } from '../Context/OrdersContext';
import { supabase, Tables } from '../lib/supabase';

interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
  isDefault: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { createOrder } = useOrders();
  const [step, setStep] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const subtotal = getCartTotal();
  const deliveryCharge = deliveryMethod === 'standard' ? (subtotal > 499 ? 0 : 99) : 199;
  const total = subtotal + deliveryCharge;

  // Address form state
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    addressLine: '',
    city: '',
    state: '',
    isDefault: false
  });

  // Check authentication and redirect with return URL
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      // Save the current checkout state to sessionStorage before redirecting
      const checkoutState = {
        step,
        deliveryMethod,
        paymentMethod,
        selectedAddressId,
        returnTo: '/checkout'
      };
      sessionStorage.setItem('checkout_state', JSON.stringify(checkoutState));
      navigate('/login');
      return;
    }
    
    // Restore checkout state after login
    const savedState = sessionStorage.getItem('checkout_state');
    if (savedState && user && cartItems.length > 0) {
      const state = JSON.parse(savedState);
      setStep(state.step || 1);
      setDeliveryMethod(state.deliveryMethod || 'standard');
      setPaymentMethod(state.paymentMethod || 'UPI');
      setSelectedAddressId(state.selectedAddressId || '');
      sessionStorage.removeItem('checkout_state');
    }
    
    if (user && cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    
    if (user) {
      loadAddresses();
    }
  }, [user, cartItems, navigate]);

  const loadAddresses = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      const formattedAddresses: Address[] = (data || []).map(addr => ({
        id: addr.id,
        name: addr.name,
        phone: addr.phone,
        pincode: addr.pincode,
        addressLine: addr.address_line,
        city: addr.city,
        state: addr.state,
        isDefault: addr.is_default
      }));

      setAddresses(formattedAddresses);
      
      // Select default address
      const defaultAddr = formattedAddresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveAddress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          name: addressForm.name,
          phone: addressForm.phone,
          pincode: addressForm.pincode,
          address_line: addressForm.addressLine,
          city: addressForm.city,
          state: addressForm.state,
          is_default: addressForm.isDefault
        })
        .select()
        .single();

      if (error) throw error;

      // If this address is set as default, update others
      if (addressForm.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', data.id);
      }

      await loadAddresses();
      setSelectedAddressId(data.id);
      setShowAddressForm(false);
      setAddressForm({
        name: '',
        phone: '',
        pincode: '',
        addressLine: '',
        city: '',
        state: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    // Check if user is logged in
    if (!user) {
      // Save current checkout state before redirecting
      const checkoutState = {
        step,
        deliveryMethod,
        paymentMethod,
        selectedAddressId,
        returnTo: '/checkout'
      };
      sessionStorage.setItem('checkout_state', JSON.stringify(checkoutState));
      navigate('/login');
      return;
    }
    
    if (!selectedAddressId) {
      alert('Please select a shipping address');
      return;
    }

    setIsOrdering(true);
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        productImage: item.images[0],
        quantity: item.quantity,
        price: item.offerPrice,
        variant: item.selectedVariant
      }));

      const order = await createOrder({
        items: orderItems,
        totalAmount: total,
        deliveryCharge: deliveryCharge,
        couponDiscount: 0,
        paymentMethod: paymentMethod,
        shippingAddressId: selectedAddressId
      });

      await clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const steps = [
    { id: 1, name: 'Address', icon: MapPin },
    { id: 2, name: 'Delivery', icon: Truck },
    { id: 3, name: 'Payment', icon: CreditCard },
  ];

  if (cartItems.length === 0 && user) {
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

  // Show loading state while checking auth
  if (!user && cartItems.length > 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded max-w-md mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <div className="max-w-3xl mx-auto mb-16">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                step >= s.id ? "bg-primary text-white" : "bg-white border-2 border-gray-200 text-gray-400"
              )}>
                <s.icon size={18} />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest mt-2",
                step >= s.id ? "text-primary" : "text-gray-400"
              )}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-2xl font-heading font-bold text-primary">Shipping Address</h2>
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={cn(
                      "p-6 border-2 rounded-card bg-white cursor-pointer transition-all",
                      selectedAddressId === addr.id ? "border-primary" : "border-gray-200 hover:border-primary"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-primary">{addr.name}</h4>
                        <p className="text-sm text-text-secondary">{addr.phone}</p>
                        <p className="text-sm text-text-secondary mt-1">
                          {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        {addr.isDefault && (
                          <span className="inline-block bg-accent/10 text-accent text-[10px] font-bold px-2 py-1 rounded-chip uppercase tracking-wider mt-2">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                        {selectedAddressId === addr.id && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => setShowAddressForm(true)}
                  className="w-full p-6 border-2 border-dashed border-gray-200 rounded-card flex items-center justify-center gap-2 text-text-secondary hover:border-accent hover:text-accent transition-all"
                >
                  <Plus size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest">Add New Address</span>
                </button>
              </div>
              <button 
                onClick={() => setStep(2)} 
                disabled={!selectedAddressId}
                className="btn-primary px-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Delivery
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-2xl font-heading font-bold text-primary">Delivery Method</h2>
              <div className="space-y-4">
                <label 
                  className={cn(
                    "flex items-center justify-between p-6 border-2 rounded-card bg-white cursor-pointer transition-all",
                    deliveryMethod === 'standard' ? "border-primary" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      checked={deliveryMethod === 'standard'}
                      onChange={() => setDeliveryMethod('standard')}
                      className="w-5 h-5 text-primary" 
                    />
                    <div>
                      <h4 className="font-bold text-primary">Standard Delivery</h4>
                      <p className="text-xs text-text-secondary">3-5 Business Days</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 uppercase text-xs">
                    {subtotal > 499 ? 'Free' : '₹99'}
                  </span>
                </label>
                <label 
                  className={cn(
                    "flex items-center justify-between p-6 border-2 rounded-card bg-white cursor-pointer transition-all",
                    deliveryMethod === 'express' ? "border-primary" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      checked={deliveryMethod === 'express'}
                      onChange={() => setDeliveryMethod('express')}
                      className="w-5 h-5 text-primary" 
                    />
                    <div>
                      <h4 className="font-bold text-primary">Express Delivery</h4>
                      <p className="text-xs text-text-secondary">Next Day Delivery</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-xs">₹199</span>
                </label>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="btn-secondary px-12">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary px-12">Continue to Payment</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-2xl font-heading font-bold text-primary">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['UPI', 'Credit / Debit Card', 'Net Banking', 'Cash on Delivery'].map((method) => (
                  <label 
                    key={method}
                    className={cn(
                      "flex items-center gap-4 p-6 border-2 rounded-card bg-white cursor-pointer transition-all",
                      paymentMethod === method ? "border-primary" : "border-gray-200"
                    )}
                  >
                    <input 
                      type="radio" 
                      name="payment"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="w-5 h-5 text-primary" 
                    />
                    <span className="font-bold text-primary text-sm">{method}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="btn-secondary px-12">Back</button>
                <button 
                  onClick={handlePlaceOrder} 
                  disabled={isOrdering}
                  className="btn-primary px-12 disabled:opacity-50"
                >
                  {isOrdering ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-card shadow-sm border border-gray-100 sticky top-32">
            <h3 className="font-heading text-xl font-bold text-primary mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedVariant}`} className="flex gap-4">
                  <div className="w-12 h-16 rounded bg-page-bg overflow-hidden shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-primary line-clamp-1">{item.name}</h5>
                    <p className="text-[10px] text-text-secondary">Qty: {item.quantity} | {item.selectedVariant}</p>
                    <p className="text-xs font-bold mt-1">{formatPrice(item.offerPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Delivery</span>
                <span className="font-bold text-green-600">{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between text-lg">
                <span className="font-heading font-bold text-primary">Total</span>
                <span className="font-heading font-bold text-accent">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddressForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-heading font-bold text-primary">Add New Address</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">Full Name</label>
                  <input type="text" name="name" value={addressForm.name} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={addressForm.phone} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">Address Line</label>
                <input type="text" name="addressLine" value={addressForm.addressLine} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">City</label>
                  <input type="text" name="city" value={addressForm.city} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">State</label>
                  <input type="text" name="state" value={addressForm.state} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">Pincode</label>
                  <input type="text" name="pincode" value={addressForm.pincode} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressFormChange} className="w-4 h-4 text-accent" />
                <span className="text-sm">Set as default address</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowAddressForm(false)} className="btn-secondary px-6">Cancel</button>
              <button onClick={saveAddress} className="btn-primary px-6">Save Address</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing import for ShoppingBag icon used in empty cart state
import { ShoppingBag } from 'lucide-react';

export default Checkout;