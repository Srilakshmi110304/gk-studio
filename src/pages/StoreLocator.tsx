// pages/StoreLocator.tsx
import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Phone } from 'lucide-react';

const StoreLocator = () => {
  return (
    <div className="min-h-screen bg-white px-6 py-16">
      {/* Title */}
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-heading font-bold text-gray-900 text-center mb-10"
      >
        Our Store - Bangalore
      </motion.h1>

      {/* Image with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl"
      >
        <img 
          src="https://images.unsplash.com/photo-1597047084897-51e81819a499?q=80&w=1600"
          alt="Bangalore Store"
          className="w-full h-[400px] object-cover"
        />
      </motion.div>

      {/* Location Details */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-10 space-y-4"
      >
        <div className="flex items-center justify-center gap-2">
          <MapPin size={20} className="text-pink-500" />
          <p className="text-lg text-gray-700 font-medium">
            GK Studio - Bangalore Flagship Store
          </p>
        </div>
        <p className="text-gray-500">
          MG Road, Bangalore, Karnataka - 560001
        </p>
        <div className="flex items-center justify-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <p className="text-gray-500">
            Open: 10 AM - 9 PM (All Days)
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Phone size={16} className="text-gray-400" />
          <p className="text-gray-500">
            +91 1234567890
          </p>
        </div>
      </motion.div>

      {/* Back to Home Button */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-12"
      >
        <a 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition shadow-md"
        >
          Back to Home
        </a>
      </motion.div>
    </div>
  );
};

export default StoreLocator;