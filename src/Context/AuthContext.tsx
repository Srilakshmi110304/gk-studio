// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendOtp: (email: string) => Promise<{ error: any | null }>;
  verifyOtp: (email: string, otp: string) => Promise<{ error: any | null; user: User | null }>;
  signOut: () => Promise<void>;
  isOtpSent: boolean;
  resetOtpState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Keys for localStorage (for cleanup only)
const WISHLIST_STORAGE_KEY = 'gkstudio_wishlist';
const CART_STORAGE_KEY = 'gkstudio_cart';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Load user from Supabase session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const sendOtp = async (email: string) => {
    try {
      console.log("Sending OTP to email:", email);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) {
        console.error("Supabase OTP error:", error);
        throw error;
      }
      
      console.log("OTP sent successfully!");
      
      // FORCE UI UPDATE
      setIsOtpSent(true);
      
      return { error: null };
    } catch (err: any) {
      console.error('Send OTP error:', err);
      return { error: err };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      console.log("Verifying OTP for email:", email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (error) {
        console.error("Verification error:", error);
        throw error;
      }
      
      console.log("OTP verified successfully!", data);
      
      if (data?.user) {
        const authUser = {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata
        };
        
        setUser(authUser);
        setIsOtpSent(false);
        
        return { error: null, user: authUser };
      }
      
      return { error: new Error('Verification failed'), user: null };
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      return { error: err, user: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    // 🔥 CLEAR ALL USER DATA from localStorage (cleanup)
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    localStorage.removeItem(CART_STORAGE_KEY);
    
    setUser(null);
    setIsOtpSent(false);
  };

  const resetOtpState = () => {
    console.log("Resetting OTP state");
    setIsOtpSent(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      sendOtp, 
      verifyOtp, 
      signOut, 
      isOtpSent,
      resetOtpState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};