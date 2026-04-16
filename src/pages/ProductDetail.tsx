// pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../components/hooks/useData';
import { formatPrice, cn } from '../lib/utils';
import { Star, Heart, ShoppingBag, Zap, ChevronRight, Truck, RotateCcw, ShieldCheck, ChevronDown } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Toast } from '../components/ui/Toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Find the current product by id from URL
  const product = products.find(p => p.id === id);
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Set default variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product.id));
    }
  }, [product, isInWishlist]);

  const relatedProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    // CRITICAL FIX: Make sure we're adding the CURRENT product, not a different one
    if (!product) {
      console.error('No product found to add to cart');
      return;
    }
    
    const variantToUse = selectedVariant || product.variants?.[0] || 'default';
    
    // --- FIX: Use the currently active image for the cart ---
    // Get the URL of the image that is currently being displayed
    const activeImageUrl = product.images?.[activeImage] || product.images?.[0];
    
    if (!activeImageUrl) {
        console.error('No image found for the active selection');
        return;
    }

    // Create a modified copy of the product for the cart.
    // Override the 'images' array to contain ONLY the currently active image URL.
    // This ensures the cart displays the exact variant the user was looking at.
    const productPayloadForCart = {
      ...product,
      images: [activeImageUrl] // <-- Only the active image
    };
    
    console.log('ADDING TO CART - Current Product:', {
      id: product.id,
      name: product.name,
      variant: variantToUse,
      quantity: quantity,
      imageToStore: activeImageUrl
    });
    
    // Add the modified payload to the cart
    addToCart(productPayloadForCart as any, quantity, variantToUse);
    setToast({ show: true, message: `${product.name} (${variantToUse}) added to cart!` });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    const variantToUse = selectedVariant || product.variants?.[0] || 'default';
    
    // Apply the same image fix for Buy Now
    const activeImageUrl = product.images?.[activeImage] || product.images?.[0];
    const productPayloadForCart = {
      ...product,
      images: [activeImageUrl]
    };
    
    addToCart(productPayloadForCart as any, quantity, variantToUse);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product);
    setIsWishlisted(!isWishlisted);
    setToast({ 
      show: true, 
      message: isWishlisted ? `${product.name} removed from wishlist` : `${product.name} added to wishlist` 
    });
    setTimeout(() => setToast({ show: false, message: '' }), 2000);
  };

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="aspect-[4/5] bg-gray-200 rounded-card"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-3xl font-heading font-bold text-primary mb-4">Product Not Found</h1>
        <p className="text-text-secondary mb-8">The product you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary inline-block">Continue Shopping</Link>
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

      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-secondary mb-10">
        <Link to="/" className="hover:text-accent">Home</Link>
        <ChevronRight size={10} />
        <Link to={`/category/${product.category.toLowerCase().replace(/\s/g, '-')}`} className="hover:text-accent">{product.category}</Link>
        <ChevronRight size={10} />
        <span className="text-primary font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
        <div className="space-y-6">
          <div className="aspect-[4/5] rounded-card overflow-hidden bg-white shadow-card relative group">
            <img 
              src={product.images?.[activeImage] || product.images?.[0]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {product.offerPercent > 0 && (
              <span className="absolute top-4 left-4 bg-sale text-white text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest">
                {product.offerPercent}% OFF
              </span>
            )}
            <button 
              onClick={handleWishlistToggle}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-10 hover:scale-110"
            >
              <Heart size={18} className={cn("transition-all duration-300", isWishlisted ? "fill-sale text-sale" : "text-primary")} />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {(product.images || []).map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "aspect-square rounded-md overflow-hidden border-2 transition-all",
                  activeImage === idx ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-6">
            <span className="bg-page-bg text-accent text-[10px] font-bold px-3 py-1 rounded-chip uppercase tracking-[0.2em] inline-block mb-4">
              {product.collection} Collection
            </span>
            <h1 className="text-4xl lg:text-5xl font-heading font-bold text-primary mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-accent/10 text-accent px-2 py-1 rounded text-sm font-bold">
                <Star size={16} className="fill-accent" />
                {product.rating}
              </div>
              <span className="text-sm text-text-secondary font-medium">
                {product.reviewCount} Verified Reviews
              </span>
            </div>
          </div>

          <div className="mb-8 p-6 bg-white rounded-card shadow-sm border border-gray-100">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.offerPrice)}</span>
              {product.price > product.offerPrice && (
                <span className="text-xl text-text-secondary line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            {product.price > product.offerPrice && (
              <p className="text-sale font-bold text-sm">
                You Save {formatPrice(product.price - product.offerPrice)} ({product.offerPercent}% OFF)
              </p>
            )}
            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-2">Inclusive of all taxes</p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary mb-4">Select Variant</h4>
              <div className="flex flex-wrap gap-3">
                {product.variants.map(variant => (
                  <button 
                    key={variant}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      "px-6 py-2 rounded-btn text-sm font-bold transition-all border-2",
                      selectedVariant === variant 
                        ? "border-primary bg-primary text-white" 
                        : "border-gray-200 text-text-secondary hover:border-primary"
                    )}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center border-2 border-gray-200 rounded-btn h-14">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-full flex items-center justify-center text-xl font-bold hover:bg-page-bg transition-colors"
              >
                -
              </button>
              <span className="w-12 h-full flex items-center justify-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-full flex items-center justify-center text-xl font-bold hover:bg-page-bg transition-colors"
              >
                +
              </button>
            </div>
            <button 
              onClick={handleAddToCart}
              className="flex-grow h-14 btn-secondary flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Add to Cart
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-grow h-14 btn-primary flex items-center justify-center gap-2"
            >
              <Zap size={20} className="fill-white" />
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-100 mb-10">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck size={24} className="text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw size={24} className="text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">7 Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck size={24} className="text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Authentic</span>
            </div>
          </div>

          <div className="space-y-4">
            <Accordion title="Product Description">
              <p className="text-sm text-text-secondary leading-relaxed">
                {product.description}
                <br /><br />
                Material: {product.material}<br />
                Weight: {product.weight}
              </p>
            </Accordion>
            <Accordion title="Material & Care">
              <p className="text-sm text-text-secondary leading-relaxed">
                Keep away from water, perfume and other chemicals. Clean with a dry soft cloth after use. Store in a separate air-tight box or pouch.
              </p>
            </Accordion>
            <Accordion title="Delivery & Returns">
              <p className="text-sm text-text-secondary leading-relaxed">
                Free standard delivery on all orders above ₹499. Estimated delivery time: 3-5 business days. Easy 7-day returns and exchanges.
              </p>
            </Accordion>
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-heading font-bold text-primary">You May Also Like</h2>
            <p className="text-text-secondary mt-2">Handpicked recommendations for you</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relatedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

const Accordion = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 pb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-2 text-sm font-bold text-primary uppercase tracking-widest"
      >
        {title}
        <ChevronDown size={18} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;