// pages/Wishlist.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../Context/WishlistContext';
import { useCart } from '../Context/CartContext';
import { formatPrice } from '../lib/utils';
import { Toast } from '../components/ui/Toast';
import ProductCard from '../components/product/ProductCard';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, getWishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [toast, setToast] = React.useState({ show: false, message: '' });

  const handleAddAllToCart = () => {
    wishlistItems.forEach(item => {
      addToCart(item, 1, item.variants[0]);
    });
    setToast({ show: true, message: `${wishlistItems.length} items added to cart` });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1, product.variants[0]);
    removeFromWishlist(product.id);
    setToast({ show: true, message: `${product.name} moved to cart` });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  if (getWishlistCount() === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-page-bg rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Heart size={40} className="text-text-secondary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-primary mb-4">Your Wishlist is Empty</h1>
          <p className="text-text-secondary mb-8">Save your favourite items here.</p>
          <Link to="/" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition inline-block">Start Shopping</Link>
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
          <h1 className="text-3xl font-heading font-bold text-primary">My Wishlist</h1>
          <p className="text-text-secondary mt-1">{getWishlistCount()} items saved</p>
        </div>
        <button onClick={handleAddAllToCart} className="btn-secondary flex items-center gap-2 hover:shadow-md transition">
          <ShoppingBag size={16} />
          Add All to Cart
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistItems.map(product => (
          <div key={product.id} className="group relative bg-white border border-pink-100 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <Link to={`/product/${product.id}`} className="relative aspect-3/4 overflow-hidden block">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
              {product.offerPercent > 0 && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                  {product.offerPercent}% OFF
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromWishlist(product.id);
                  setToast({ show: true, message: `${product.name} removed from wishlist` });
                  setTimeout(() => setToast({ show: false, message: '' }), 2000);
                }}
                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
              >
                <Trash2 size={16} className="text-rose-500" />
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
                onClick={() => handleMoveToCart(product)}
                className="w-full btn-secondary py-2 text-sm flex items-center justify-center gap-2 hover:shadow-md transition"
              >
                <ShoppingBag size={14} />
                Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;