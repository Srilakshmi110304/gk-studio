// pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { useProducts, useCategories, useHeroImages, useSiteConfig } from '../components/hooks/useData';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

const Home = () => {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { heroImages, loading: heroLoading } = useHeroImages();
  const { config } = useSiteConfig();
  const { user } = useAuth();
  
  const [heroIndex, setHeroIndex] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 800 });
  
  // Parallax scroll effects
  const { scrollY } = useScroll();
  
  // Image moves slower (parallax effect)
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  
  // Optional: slight zoom effect
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);
  
  // Text moves opposite direction for depth
  const textY = useTransform(scrollY, [0, 500], [0, -50]);
  
  // Get new arrivals - first 4 products
  const newArrivals = products.slice(0, 4);

  // Handle window resize for particles
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Auto-rotate hero images
  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Show popup after 20 seconds only if user is NOT logged in
  // Popup shows on EVERY page load after 20 seconds (no sessionStorage blocking)
  useEffect(() => {
    // Don't show popup if user is already logged in
    if (user) return;

    const timer = setTimeout(() => {
      setShowLoginPopup(true);
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, [user]);

  // Handle mouse movement for 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 20; // horizontal tilt
    const y = (e.clientY / innerHeight - 0.5) * 20; // vertical tilt
    setMouse({ x, y });
  };

  if (productsLoading || categoriesLoading || heroLoading) {
    return (
      <div className="flex flex-col gap-24 pb-20">
        <div className="relative h-[85vh] bg-gray-200 animate-pulse"></div>
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentHero = heroImages[heroIndex] || {
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format',
    title: 'Timeless Elegance For Every Occasion',
    subtitle: 'Discover our curated collection of handcrafted imitation jewellery and orthopedic footwear designed for style and comfort.',
    cta_text: 'Shop Collection',
    cta_link: '/category/necklaces'
  };

  // Helper function to get category products
  const getCategoryProducts = (categoryName: string) => {
    return products.filter(p => p.category === categoryName);
  };

  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section with Parallax Effect & 3D Mouse Tilt */}
      <section 
        onMouseMove={handleMouseMove}
        className="relative h-[85vh] lg:h-[90vh] overflow-hidden"
      >
        <div className="absolute inset-0 perspective-[1000px]">
          <motion.img
            src={currentHero.image_url}
            alt={currentHero.title}
            style={{
              y,
              scale,
              rotateX: -mouse.y,
              rotateY: mouse.x,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="w-full h-full object-cover object-center will-change-transform"
          />
          <motion.div 
            style={{ y }}
            className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"
          />
          
          {/* Light Reflection Effect - follows mouse cursor */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + mouse.x * 2}% ${50 + mouse.y * 2}%, rgba(255,255,255,0.15), transparent 40%)`
            }}
          />
        </div>
        
        <div className="relative h-full container-custom flex flex-col justify-center items-start text-white">
          <motion.span 
            key={heroIndex} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ y: textY, x: mouse.x * 0.5 }}
            className="text-gold font-bold uppercase tracking-[0.3em] text-sm mb-4"
          >
            {config?.hero_badge || 'Spring Collection 2026'}
          </motion.span>
          <motion.h1 
            key={heroIndex + 'title'} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            style={{ y: textY, x: mouse.x * 0.5 }}
            className="text-5xl lg:text-7xl font-heading font-bold mb-6 max-w-2xl leading-tight"
          >
            {currentHero.title}
          </motion.h1>
          <motion.p 
            key={heroIndex + 'desc'} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            style={{ y: textY, x: mouse.x * 0.5 }}
            className="text-base text-gray-200 mb-8 max-w-xl"
          >
            {currentHero.subtitle}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            style={{ y: textY, x: mouse.x * 0.5 }}
          >
            <Link to={currentHero.cta_link} className="btn-primary flex items-center gap-2 group">
              {currentHero.cta_text} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
        
        {/* Hero Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setHeroIndex(idx)} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${heroIndex === idx ? 'w-8 bg-gold' : 'bg-white/50'}`} 
            />
          ))}
        </div>

        {/* Floating Particles Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                opacity: 0
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      </section>

      {/* Category Icon Grid */}
      <section className="container-custom">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary">Shop By Category</h2>
            <p className="text-text-secondary mt-2">Explore our collections</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => {
            const catProducts = getCategoryProducts(cat.name);
            const previewImage = catProducts.length > 0 ? catProducts[0].images[0] : cat.image;
            return (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="group flex flex-col items-center text-center">
                <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 mb-3 bg-white">
                  <img src={previewImage} alt={cat.name} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="font-heading text-base font-bold text-primary group-hover:text-accent transition-colors">{cat.name}</h3>
                <span className="text-xs text-text-secondary">{cat.subCategories?.length || 0} Types</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-white py-20">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary">New Arrivals</h2>
              <p className="text-text-secondary mt-2">The latest additions to our studio</p>
            </div>
            <Link to="/category/all" className="text-accent font-bold uppercase tracking-widest text-xs flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {newArrivals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No products available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category Strips - Only show featured categories that have products */}
      {categories.filter(c => c.featured).map((category) => {
        const categoryProducts = getCategoryProducts(category.name);
        // Get first 6 images from the category products
        const imagesToShow = categoryProducts.slice(0, 6).flatMap(p => p.images).slice(0, 6);
        
        if (imagesToShow.length === 0) return null;
        
        return (
          <section key={category.id} className="container-custom">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-heading font-bold text-primary">{category.name}</h2>
                <p className="text-text-secondary mt-2">Discover our stunning {category.name.toLowerCase()} collection</p>
              </div>
              <Link to={`/category/${category.slug}`} className="text-accent text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {imagesToShow.map((img, index) => (
                <Link key={index} to={`/category/${category.slug}`} className="min-w-48 group cursor-pointer">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-300 bg-white">
                    <img src={img} alt={`${category.name} ${index + 1}`} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors">{category.name} Style {index + 1}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* App Download Section */}
      <section className="bg-primary py-16">
        <div className="container-custom flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-heading font-bold text-white">Experience GK Studio on Mobile</h2>
            <p className="text-gray-300 mt-2">Get exclusive offers and faster checkout on our app.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-black/80 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-black transition-colors">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" className="h-8" />
            </button>
            <button className="bg-black/80 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-black transition-colors">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-8" />
            </button>
          </div>
        </div>
      </section>

      {/* Login Popup Modal */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLoginPopup(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setShowLoginPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
            
            {/* Reuse Login Component with isPopup prop */}
            <Login isPopup onClose={() => setShowLoginPopup(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;