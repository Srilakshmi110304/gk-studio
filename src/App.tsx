// App.tsx - With Animated Page Transitions
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from './Context/CartContext';
import { WishlistProvider } from './Context/WishlistContext';
import { OrdersProvider } from './Context/OrdersContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollProgress from './components/ui/ScrollProgress';
import BackToTop from './components/ui/BackToTop';
import Home from './pages/Home';
import CategoryListing from './pages/CategoryListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StoreLocator from './pages/StoreLocator';
import RecentlyViewedPage from './pages/RecentlyViewedPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-grow"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<CategoryListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/store-locator" element={<StoreLocator />} />
          <Route path="/recently-viewed" element={<RecentlyViewedPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <OrdersProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <ScrollProgress />
                <main className="flex-grow">
                  <AnimatedRoutes />
                </main>
                <Footer />
                <BackToTop />
              </div>
            </OrdersProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;