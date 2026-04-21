// components/ui/Toast.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md text-gray-800 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-100"
        >
          <CheckCircle2 size={20} className="text-green-500" />
          <span className="text-sm font-medium">{message}</span>
          <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 transition">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};