// components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import TrustBar from './TrustBar';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../Context/CartContext'; 
import { useWishlist } from '../../Context/WishlistContext'; 
import { useNavbar } from '../hooks/useNavbar';

const Navbar = () => {
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { navbar, loading, error } = useNavbar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full shadow-lg">
        <TrustBar />
        <div className="bg-white border-b shadow-sm">
          <div className="container-custom h-24 flex items-center justify-between gap-10">
            <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-48 h-8 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  const menuItems = navbar?.menu || [];

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg">
      {/* Trust Bar FIRST - Above Navbar */}
      <TrustBar />

      {/* Navbar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container-custom h-24 flex items-center justify-between gap-10">
          <button 
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Logo with Subtitle - Premium Layout */}
          <Link to="/" className="flex flex-col leading-tight">
            <span className="text-2xl font-heading font-semibold tracking-wide text-gray-900 whitespace-nowrap">
              {navbar?.logo_text || "GK STUDIO"}
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-gray-500">
              Jewellery & Footwear
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10 h-full ml-6">
            {menuItems
              .filter((item: any) => item.enabled !== false)
              .map((item: any) => (
              <div 
                key={item.slug}
                className="h-full flex items-center"
                onMouseEnter={() => item.mega_menu && setActiveMegaMenu(item.name)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link 
                  to={`/category/${item.slug}`}
                  className="text-sm font-semibold text-gray-700 hover:text-black transition-colors flex items-center gap-1 tracking-wide relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-pink-500 after:transition-all hover:after:w-full"
                >
                  {item.name}
                  {item.mega_menu && <ChevronDown size={14} className="opacity-70" />}
                </Link>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-5 lg:gap-6">
            {/* Search Icon */}
            <button className="flex flex-col items-center group">
              <Search size={22} strokeWidth={1.5} className="text-gray-500 group-hover:text-black transition" />
              <span className="w-4 h-[2px] bg-pink-500 mt-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </button>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="hidden sm:block">
              <div className="flex flex-col items-center group relative">
                <Heart size={22} strokeWidth={1.5} className="text-gray-500 group-hover:text-black transition" />
                <span className="w-4 h-[2px] bg-pink-500 mt-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md">
                    {getWishlistCount()}
                  </span>
                )}
              </div>
            </Link>

            {/* Account Icon */}
            <Link to="/account" className="hidden sm:block">
              <div className="flex flex-col items-center group">
                <User size={22} strokeWidth={1.5} className="text-gray-500 group-hover:text-black transition" />
                <span className="w-4 h-[2px] bg-pink-500 mt-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </div>
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative">
              <div className="flex flex-col items-center group">
                <ShoppingBag size={22} strokeWidth={1.5} className="text-gray-500 group-hover:text-black transition" />
                <span className="w-4 h-[2px] bg-pink-500 mt-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md">
                    {getCartCount()}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mega Menu - Dynamic */}
      <AnimatePresence>
        {activeMegaMenu && navbar?.menu && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-pink-100 hidden lg:block"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="container-custom py-12 grid grid-cols-4 gap-10">
              {(() => {
                const activeItem = menuItems.find((item: any) => item.name === activeMegaMenu);
                if (!activeItem?.mega_menu) return null;
                
                return activeItem.mega_menu.map((section: any, idx: number) => (
                  <div key={section.section || idx} className="space-y-5">
                    <h4 className="font-heading font-bold text-lg border-b border-gray-100 pb-2 tracking-wide text-primary">
                      {section.section}
                    </h4>
                    <ul className="space-y-3">
                      {section.items.map((sub: string, subIdx: number) => (
                        <li key={subIdx}>
                          <Link 
                            to={section.base_path ? `${section.base_path}/${sub.toLowerCase().replace(/\s+/g, '-')}` : "#"} 
                            className="text-sm text-text-secondary hover:text-pink-500 transition-colors"
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ));
              })()}
              
              {(() => {
                const activeItem = menuItems.find((item: any) => item.name === activeMegaMenu);
                if (activeItem?.mega_menu_image) {
                  return (
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl shadow-xl group">
                      <img 
                        src={activeItem.mega_menu_image} 
                        alt={activeItem.name} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                        <span className="text-white text-xs font-bold uppercase tracking-widest mb-1">
                          {activeItem.mega_menu_badge || "New Collection"}
                        </span>
                        <h5 className="text-white font-heading text-xl font-bold">
                          {activeItem.mega_menu_title || activeItem.name}
                        </h5>
                        <Link to={activeItem.mega_menu_cta_link || "#"} className="text-white text-xs underline mt-2 hover:text-pink-300 transition">
                          {activeItem.mega_menu_cta_text || "Shop Now"}
                        </Link>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] shadow-2xl overflow-y-auto"
            >
              <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <div className="flex flex-col leading-tight">
                  <span className="text-xl font-heading font-semibold tracking-wide text-gray-900">
                    {navbar?.logo_text || "GK STUDIO"}
                  </span>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-gray-500">
                    Jewellery & Footwear
                  </span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                  <X size={24} className="text-gray-700" />
                </button>
              </div>
              <div className="py-4">
                {menuItems
                  .filter((item: any) => item.enabled !== false)
                  .map((item: any) => (
                  <Link 
                    key={item.slug}
                    to={`/category/${item.slug}`}
                    className="block px-6 py-4 text-base font-medium text-gray-700 border-b border-gray-100 hover:bg-gray-50 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link 
                  to="/login"
                  className="block px-6 py-4 text-base font-medium text-gray-700 border-b border-gray-100 hover:bg-gray-50 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Sign Up
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;