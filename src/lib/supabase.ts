// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create and export the REAL Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'gkstudio_supabase_session',
  },
});

// Types for Supabase tables
export type Tables = {
  profiles: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dob: string | null;
    gender: 'male' | 'female' | 'other' | null;
    created_at: string;
    updated_at: string;
  };
  addresses: {
    id: string;
    user_id: string;
    name: string;
    phone: string;
    pincode: string;
    address_line: string;
    city: string;
    state: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  };
  orders: {
    id: string;
    user_id: string;
    order_number: string;
    total_amount: number;
    delivery_charge: number;
    coupon_discount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: string;
    payment_status: 'pending' | 'completed' | 'failed';
    shipping_address_id: string;
    created_at: string;
    updated_at: string;
  };
  order_items: {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    variant: string;
  };
  cart_items: {
    id: string;
    user_id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    price: number;
    quantity: number;
    variant: string;
    created_at: string;
    updated_at: string;
  };
  wishlist_items: {
    id: string;
    user_id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    price: number;
    variant: string;
    created_at: string;
  };
};