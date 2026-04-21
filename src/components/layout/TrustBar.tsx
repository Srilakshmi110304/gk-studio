// components/layout/TrustBar.tsx
import React from 'react';
import { Truck, RotateCcw, MessageCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrustBar = () => {
  return (
    <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 py-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
      <div className="container-custom flex flex-wrap justify-between items-center gap-4 text-xs font-medium text-white uppercase tracking-wider relative z-10">
        <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          <Truck size={14} className="text-white" />
          <span>Free Shipping (orders above ₹499)</span>
        </div>
        <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          <MapPin size={14} className="text-white" />
          <span>60+ Stores Nationwide</span>
        </div>
        <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          <RotateCcw size={14} className="text-white" />
          <span>Easy Returns Centre</span>
        </div>
        <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          <MessageCircle size={14} className="text-white" />
          <span>WhatsApp Support</span>
        </div>
        <Link 
          to="/store-locator"
          className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all hover:scale-105"
        >
          <MapPin size={12} className="text-white" />
          <span className="text-white text-xs">Find a Store</span>
        </Link>
      </div>
    </div>
  );
};

export default TrustBar;