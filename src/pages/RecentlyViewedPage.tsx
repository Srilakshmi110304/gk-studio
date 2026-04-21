// pages/RecentlyViewedPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useRecentlyViewed } from '../components/hooks/useRecentlyViewed';
import { useAuth } from '../Context/AuthContext';
import { useCart } from '../Context/CartContext';
import { formatPrice } from '../lib/utils';
import { Toast } from '../components/ui/Toast';

const RecentlyViewedPage = () => {
  const { user } = useAuth();
  const { items, loading, clearHistory, removeItem } = useRecentlyViewed();
  const { addToCart } = useCart();
  const [toast, setToast] = React.useState({ show: false, message: '' });

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.variants?.[0] || 'default');
    setToast({ show: true, message: `${product.name} added to cart` });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const handleRemoveItem = (productId: string, productName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeItem(productId);
    setToast({ show: true, message: `${productName} removed from recently viewed` });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  // Don't show if not logged in
  if (!user) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-page-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye size={40} className="text-text-secondary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-primary mb-4">Login to View</h1>
          <p className="text-text-secondary mb-8">Please login to see your recently viewed items.</p>
          <Link to="/login" className="btn-primary inline-block">Login / Sign Up</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer rounded-xl aspect-3/4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <Toast
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Recently Viewed</h1>
          <p className="text-text-secondary mt-1">
            Products you've been looking at ({items.length} items)
          </p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/" 
            className="text-accent text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
          {items.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sale text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-page-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye size={40} className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-heading font-bold text-primary mb-2">No recently viewed items</h2>
          <p className="text-text-secondary mb-6">
            Products you view will appear here
          </p>
          <Link to="/" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product.id} className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
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
                <button
                  onClick={(e) => handleRemoveItem(product.id, product.name, e)}
                  className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
                >
                  <Trash2 size={16} className="text-text-secondary hover:text-sale transition-colors" />
                </button>
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
                    <span className="text-xs font-bold">{product.rating}</span> ★
                  </div>
                  <span className="text-xs text-text-secondary">({product.reviewCount} Reviews)</span>
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
      )}
    </div>
  );
};

export default RecentlyViewedPage;