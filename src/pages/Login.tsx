// pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, ChevronLeft, KeyRound, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoginProps {
  isPopup?: boolean;
  onClose?: () => void;
}

const Login = ({ isPopup = false, onClose }: LoginProps) => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, isOtpSent, resetOtpState } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  
  // Local state to force OTP screen even on rate limit
  const [localOtpSent, setLocalOtpSent] = useState(false);
  
  // Cooldown timer state (60 seconds)
  const [cooldown, setCooldown] = useState(0);

  // Log state changes for debugging
  useEffect(() => {
    console.log("isOtpSent state changed to:", isOtpSent);
    console.log("localOtpSent state changed to:", localOtpSent);
  }, [isOtpSent, localOtpSent]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Reset local OTP state when isOtpSent resets
  useEffect(() => {
    if (!isOtpSent) {
      setLocalOtpSent(false);
    }
  }, [isOtpSent]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check cooldown - prevents spam
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again`);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (!email) {
        throw new Error('Email is required');
      }
      
      console.log("Calling sendOtp for email:", email);
      const { error: otpError } = await sendOtp(email);
      
      console.log("OTP SENT RESPONSE:", otpError);
      
      if (otpError) {
        // Handle rate limiting gracefully - SHOW OTP SCREEN ANYWAY
        if (otpError.message?.toLowerCase().includes('rate_limit') || 
            otpError.message?.toLowerCase().includes('too many') ||
            otpError.status === 429) {
          
          // OTP was already sent in a previous request
          setError("⚠️ OTP already sent! Please check your email (including spam folder).");
          setLocalOtpSent(true); // FORCE OTP UI to show
          setCooldown(30); // Shorter cooldown for rate limit
          return;
        }
        throw otpError;
      }
      
      console.log("Setting OTP state TRUE");
      setCooldown(60); // Start cooldown after successful send
      
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      setCooldown(30);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!otp) {
        throw new Error('Please enter the OTP');
      }
      
      if (otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }
      
      console.log("Verifying OTP:", otp);
      const { error: verifyError, user } = await verifyOtp(email, otp);
      
      if (verifyError) throw verifyError;
      
      if (user) {
        console.log("User verified");
        
        if (isPopup) {
          // For popup mode: close popup and reload page to reflect logged-in state
          if (onClose) {
            onClose();
          }
          // Reload the page to update the UI with logged-in user state
          window.location.reload();
        } else {
          // For regular page: navigate to account
          navigate('/account');
        }
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Check cooldown for resend
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another OTP`);
      return;
    }
    
    setIsResending(true);
    setError('');

    try {
      console.log("Resending OTP to:", email);
      const { error: otpError } = await sendOtp(email);
      
      console.log("Resend OTP RESPONSE:", otpError);
      
      if (otpError) {
        if (otpError.message?.toLowerCase().includes('rate_limit') || 
            otpError.message?.toLowerCase().includes('too many') ||
            otpError.status === 429) {
          // Don't show error for rate limit on resend - OTP was already sent
          setError("⚠️ OTP already sent recently. Please check your email.");
          setCooldown(30);
          return;
        }
        throw otpError;
      }
      
      // Show success message for resend
      setError('');
      alert('✅ OTP resent successfully! Check your email.');
      setCooldown(60);
      
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend OTP. Please try again.');
      setCooldown(30);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToEmail = () => {
    console.log("Going back to email input");
    resetOtpState();
    setLocalOtpSent(false);
    setOtp('');
    setError('');
    setCooldown(0);
  };

  // Determine if we should show OTP screen
  const showOtpScreen = isOtpSent || localOtpSent;
  
  // Debug render
  console.log("Login render - showOtpScreen:", showOtpScreen, "email:", email, "cooldown:", cooldown, "isPopup:", isPopup);

  return (
    <div className={cn(
      "w-full",
      !isPopup && "min-h-screen bg-page-bg flex items-center justify-center py-20 px-4"
    )}>
      <div className={cn(
        "w-full max-w-md",
        !isPopup && "mx-auto"
      )}>
        <div className={cn(
          "bg-white rounded-2xl shadow-card p-8 md:p-10 border border-gray-100",
          isPopup && "shadow-2xl"
        )}>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">
              {!showOtpScreen ? 'Welcome Back' : 'Verify Your Email'}
            </h1>
            <p className="text-text-secondary text-sm">
              {!showOtpScreen 
                ? 'Sign in with your email address' 
                : `Enter the verification code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className={cn(
              "mb-6 p-4 border rounded-xl text-sm",
              error.includes("already sent") || error.includes("OTP already") 
                ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                : "bg-red-50 border-red-200 text-red-600"
            )}>
              {error}
            </div>
          )}

          {!showOtpScreen ? (
            // Step 1: Send OTP Form
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none" 
                    placeholder="name@example.com" 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className={cn(
                  "w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg shadow-accent/20 transition-all active:scale-[0.98]",
                  (loading || cooldown > 0) && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : cooldown > 0 ? (
                  <span>Wait {cooldown}s</span>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {cooldown > 0 && (
                <p className="text-xs text-center text-accent mt-2">
                  ⏱️ Please wait {cooldown} seconds before requesting another OTP
                </p>
              )}

              <div className="text-center pt-4">
                <p className="text-xs text-text-secondary">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          ) : (
            // Step 2: Verify OTP Form
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-center text-2xl tracking-[0.5em] font-mono" 
                    placeholder="000000" 
                    maxLength={6}
                    required 
                    autoFocus
                  />
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Enter the 6-digit verification code sent to your email
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  💡 Tip: Check your spam folder if you don't see the email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg shadow-accent/20 transition-all active:scale-[0.98]",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Sign In</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-accent text-sm font-bold hover:underline flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  Back to Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || cooldown > 0}
                  className={cn(
                    "text-accent text-sm font-bold hover:underline",
                    (isResending || cooldown > 0) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isResending ? 'Sending...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;