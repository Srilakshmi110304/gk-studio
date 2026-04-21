// components/product/ProductCard.tsx
import React, { useState, useEffect } from 'react';
import { Heart, Star, ShoppingCart, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { formatPrice, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../../Context/CartContext';
import { useWishlist } from '../../Context/WishlistContext';
import { Toast } from '../ui/Toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.variants?.[0] || 'default');
    setToast({ show: true, message: `${product.name} added to cart` });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    setIsWishlisted(!isWishlisted);
    setToast({ show: true, message: isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist` });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  return (
    <>
      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ show: false, message: '' })} />
      <motion.div 
        className="group relative bg-white rounded-card overflow-hidden flex flex-col h-full transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300 z-10 pointer-events-none" />
        
        <div className="relative aspect-3/4 overflow-hidden block">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img 
              src={product.images[0]} 
              alt={product.name}
              className={cn("w-full h-full object-cover transition-all duration-700 group-hover:scale-110", isHovered ? "opacity-0 scale-110" : "opacity-100 scale-100")}
            />
            <img 
              src={product.images[1] || product.images[0]} 
              alt={product.name}
              className={cn("absolute inset-0 w-full h-full object-cover transition-all duration-700", isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100")}
            />
          </Link>

          {product.offerPercent > 0 && (
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {product.offerPercent}% OFF
              </span>
            </div>
          )}

          <button 
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-20 hover:scale-110"
          >
            <Heart size={18} className={cn("transition-all duration-300", isWishlisted ? "fill-rose-500 text-rose-500" : "text-primary")} />
          </button>

          <button 
            onClick={() => setShowQuickView(true)}
            className={cn("absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm text-white py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 z-20", isHovered ? "translate-y-0" : "translate-y-full")}
          >
            <Eye size={14} /> Quick View
          </button>

          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                exit={{ y: 50 }}
                onClick={handleAddToCart}
                className="absolute bottom-12 left-0 w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:shadow-lg transition-all z-20"
              >
                <ShoppingCart size={16} /> Quick Add
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 flex flex-col grow">
          <span className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">{product.collection}</span>
          <Link to={`/product/${product.id}`} className="grow">
            <h3 className="font-heading text-lg font-bold text-primary leading-tight line-clamp-2 mb-2 group-hover:text-pink-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center text-pink-500 gap-1">
              <Star size={12} className="fill-pink-500" />
              <span className="text-xs font-bold">{product.rating}</span>
            </div>
            <span className="text-xs text-text-secondary">({product.reviewCount} Reviews)</span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-pink-600">{formatPrice(product.offerPrice)}</span>
            {product.price > product.offerPrice && (
              <>
                <span className="text-sm text-text-secondary line-through">{formatPrice(product.price)}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setShowQuickView(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <img src={product.images[0]} alt={product.name} className="w-full h-80 object-cover rounded-t-2xl" />
                <button onClick={() => setShowQuickView(false)} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">{product.collection}</span>
                <h3 className="text-xl font-heading font-bold text-primary mt-1">{product.name}</h3>
                <p className="text-sm text-text-secondary mt-4 line-clamp-3">{product.description || 'Beautiful handcrafted piece.'}</p>
                <div className="mt-6 flex gap-3">
                  <Link to={`/product/${product.id}`} onClick={() => setShowQuickView(false)} className="flex-1 btn-secondary text-center py-2 border border-gray-200 rounded-btn">View Details</Link>
                  <button onClick={handleAddToCart} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-btn hover:shadow-lg transition">Add to Cart</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;