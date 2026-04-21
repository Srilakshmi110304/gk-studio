// components/product/RecentlyViewed.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag } from 'lucide-react';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useCart } from '../../Context/CartContext';
import { formatPrice } from '../../lib/utils';
import { Toast } from '../ui/Toast';

interface RecentlyViewedProps {
  currentId?: string;
  limit?: number;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ currentId, limit = 4 }) => {
  const { items, loading } = useRecentlyViewed();
  const { addToCart } = useCart();
  const [toast, setToast] = React.useState({ show: false, message: '' });

  // Filter out current product and limit the items
  const filteredItems = items
    .filter(item => item.id !== currentId)
    .slice(0, limit);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.variants?.[0] || 'default');
    setToast({ show: true, message: `${product.name} added to cart` });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  if (loading) {
    return (
      <section className="mt-20">
        <div className="mb-10">
          <h2 className="text-3xl font-heading font-bold text-primary">Recently Viewed</h2>
          <p className="text-text-secondary mt-2">Products you've been looking at</p>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="shimmer rounded-xl aspect-3/4"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <section className="mt-20">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary">Recently Viewed</h2>
          <p className="text-text-secondary mt-2">Products you've been looking at ({filteredItems.length} items)</p>
        </div>
        <Link 
          to="/recently-viewed" 
          className="text-accent text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
        >
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredItems.map((product) => (
          <div 
            key={product.id} 
            className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            <Link to={`/product/${product.id}`} className="relative aspect-3/4 overflow-hidden block">
              <img 
                src={product.images?.[0]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
              />
              {product.offerPercent > 0 && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                  {product.offerPercent}% OFF
                </span>
              )}
            </Link>
            <div className="p-5 flex flex-col grow">
              <span className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-1">{product.collection}</span>
              <Link to={`/product/${product.id}`} className="grow">
                <h3 className="font-heading text-base font-medium text-text-primary leading-tight line-clamp-2 mb-2 group-hover:text-pink-500 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-pink-500">
                  <span className="text-xs font-bold">{product.rating || 4.5}</span> ★
                </div>
                <span className="text-xs text-text-secondary">({product.reviewCount || 0} Reviews)</span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap mb-4">
                <span className="text-lg font-bold text-pink-600">{formatPrice(product.offerPrice)}</span>
                {product.price > product.offerPrice && (
                  <span className="text-sm text-text-secondary line-through">{formatPrice(product.price)}</span>
                )}
              </div>
              <button
                onClick={(e) => handleAddToCart(product, e)}
                className="w-full btn-secondary py-2 text-sm flex items-center justify-center gap-2 hover:shadow-md transition"
              >
                <ShoppingBag size={14} />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;