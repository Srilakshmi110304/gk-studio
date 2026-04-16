// context/OrdersContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Tables } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  delivery_charge: number;
  coupon_discount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  items: OrderItem[];
  shipping_address: Tables['addresses'];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  variant: string;
}

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: CreateOrderData) => Promise<Order>;
  getOrder: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<void>;
}

interface CreateOrderData {
  items: CartItemForOrder[];
  totalAmount: number;
  deliveryCharge: number;
  couponDiscount: number;
  paymentMethod: string;
  shippingAddressId: string;
}

interface CartItemForOrder {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variant: string;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Local storage key for orders (backup)
const ORDERS_STORAGE_KEY = 'gkstudio_orders';

export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders whenever user changes
  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      console.log("📦 Loading orders for user:", user.id);
      
      // First, fetch orders from Supabase
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        // Fallback to localStorage
        loadOrdersFromLocalStorage();
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch order items for all orders
      const orderIds = ordersData.map(order => order.id);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      }

      // Fetch shipping addresses
      const addressIds = [...new Set(ordersData.map(order => order.shipping_address_id))];
      
      const { data: addressesData, error: addressesError } = await supabase
        .from('addresses')
        .select('*')
        .in('id', addressIds);

      if (addressesError) {
        console.error("Error fetching addresses:", addressesError);
      }

      // Combine data
      const formattedOrders: Order[] = ordersData.map(order => {
        const orderItems = (itemsData || []).filter(item => item.order_id === order.id);
        const shippingAddress = (addressesData || []).find(addr => addr.id === order.shipping_address_id);
        
        return {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          delivery_charge: order.delivery_charge,
          coupon_discount: order.coupon_discount,
          status: order.status,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          created_at: order.created_at,
          items: orderItems.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant
          })),
          shipping_address: shippingAddress as Tables['addresses']
        };
      });

      setOrders(formattedOrders);
      
      // Also save to localStorage as backup
      const ordersWithUser = formattedOrders.map(order => ({ ...order, user_id: user.id }));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersWithUser));
      
    } catch (error) {
      console.error('Error loading orders:', error);
      loadOrdersFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersFromLocalStorage = () => {
    try {
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders && user) {
        const allOrders = JSON.parse(savedOrders);
        const userOrders = allOrders.filter((order: any) => order.user_id === user.id);
        setOrders(userOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      setOrders([]);
    }
  };

  const saveOrdersToLocalStorage = (ordersToSave: Order[]) => {
    const ordersWithUser = ordersToSave.map(order => ({ ...order, user_id: user?.id }));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersWithUser));
  };

  const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
    if (!user) {
      throw new Error('User must be logged in to create an order');
    }

    console.log("📦 Creating order with data:", orderData);

    try {
      // Generate unique order number
      const orderNumber = `GK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // 🔥 Step 1: Insert order with ALL required fields
      const orderPayload = {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: Number(orderData.totalAmount), // Ensure number type
        delivery_charge: Number(orderData.deliveryCharge), // Ensure number type
        coupon_discount: Number(orderData.couponDiscount), // Ensure number type
        status: 'confirmed' as const,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentMethod === 'Cash on Delivery' ? 'pending' : 'completed',
        shipping_address_id: orderData.shippingAddressId
      };
      
      console.log("📦 ORDER PAYLOAD:", orderPayload);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) {
        console.error("❌ Order insert failed:", orderError);
        throw new Error(`Order creation failed: ${orderError.message}`);
      }

      if (!order) {
        throw new Error('No order data returned from Supabase');
      }

      console.log("✅ Order created successfully:", order);

      // 🔥 Step 2: Insert order items with order_id
      const orderItems = orderData.items.map((item, index) => ({
        order_id: order.id, // CRITICAL: Must have order_id
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        quantity: Number(item.quantity),
        price: Number(item.price),
        variant: item.variant || ''
      }));

      console.log("📦 ORDER ITEMS PAYLOAD:", orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error("❌ Order items insert failed:", itemsError);
        // Note: Order is created but items failed - you might want to delete the order
        throw new Error(`Order items creation failed: ${itemsError.message}`);
      }

      console.log("✅ Order items created successfully");

      // Get shipping address details
      let shippingAddress = null;
      try {
        const { data: addressData } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', orderData.shippingAddressId)
          .single();
        shippingAddress = addressData;
      } catch (err) {
        console.error("⚠️ Could not fetch shipping address:", err);
      }

      // Format the order for return
      const formattedOrder: Order = {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        delivery_charge: order.delivery_charge,
        coupon_discount: order.coupon_discount,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        items: orderData.items.map((item, idx) => ({
          id: `temp_${idx}`,
          product_id: item.productId,
          product_name: item.productName,
          product_image: item.productImage,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant
        })),
        shipping_address: shippingAddress as Tables['addresses']
      };

      // Save to localStorage as backup
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      let existingOrders = [];
      if (savedOrders) {
        existingOrders = JSON.parse(savedOrders);
      }
      const orderWithUser = { ...formattedOrder, user_id: user.id };
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([orderWithUser, ...existingOrders]));

      // Update state
      setOrders(prev => [formattedOrder, ...prev]);

      return formattedOrder;
      
    } catch (err: any) {
      console.error('❌ Create order error:', err);
      throw err;
    }
  };

  const getOrder = async (orderId: string): Promise<Order | null> => {
    // First check local state
    const localOrder = orders.find(order => order.id === orderId);
    if (localOrder) return localOrder;
    
    // Then try Supabase
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        throw error;
      }

      // Fetch order items
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      // Fetch shipping address
      const { data: address } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', order.shipping_address_id)
        .single();

      return {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        delivery_charge: order.delivery_charge,
        coupon_discount: order.coupon_discount,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        created_at: order.created_at,
        items: (items || []).map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant
        })),
        shipping_address: address as Tables['addresses']
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!user) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const }
          : order
      ));

      // Update localStorage
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        const updatedOrders = allOrders.map((order: any) =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        );
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      }
      
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  return (
    <OrdersContext.Provider value={{ orders, loading, createOrder, getOrder, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within OrdersProvider');
  return context;
};