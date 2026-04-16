// components/layout/TrustBar.tsx
import React from 'react';
import { Truck, RotateCcw, MessageCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrustBar = () => {
  return (
    <div className="bg-primary py-3">
      <div className="container-custom flex flex-wrap justify-between items-center gap-4 text-xs font-medium text-white uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-white" />
          <span>Free Shipping (orders above ₹499)</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-white" />
          <span>60+ Stores Nationwide</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw size={14} className="text-white" />
          <span>Easy Returns Centre</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle size={14} className="text-white" />
          <span>WhatsApp Support</span>
        </div>
        <Link 
          to="/store-locator"
          className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
        >
          <MapPin size={12} className="text-white" />
          <span className="text-white text-xs">Find a Store</span>
        </Link>
      </div>
    </div>
  );
};

export default TrustBar;