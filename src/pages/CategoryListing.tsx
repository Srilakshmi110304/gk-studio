// pages/CategoryListing.tsx
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts, useCategories } from '../components/hooks/useData';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../Context/CartContext';
import { Toast } from '../components/ui/Toast';
import { ChevronRight, Filter, X, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';

const CategoryListing = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { addToCart } = useCart();
  const [toast, setToast] = useState({ show: false, message: '' });
  const [priceRange, setPriceRange] = useState(10000);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Find the category by slug
  const category = categories.find(c => c.slug === slug);
  
  // Filter products by category with improved matching (case-insensitive and trimmed)
  const categoryProducts = useMemo(() => {
    if (!category) return [];
    
    // Normalize the category name from the data (trim and lowercase)
    const normalizedCategoryName = category.name.toLowerCase().trim();
    
    return products.filter(p => {
      const productCategory = p.category?.toLowerCase().trim();
      return productCategory === normalizedCategoryName && p.isActive !== false;
    });
  }, [products, category]);

  const availableSubCategories = useMemo(() => {
    const subs = new Set<string>();
    categoryProducts.forEach(p => {
      if (p.subCategory) subs.add(p.subCategory);
    });
    return Array.from(subs);
  }, [categoryProducts]);

  const availableCollections = useMemo(() => {
    const cols = new Set<string>();
    categoryProducts.forEach(p => {
      if (p.collection) cols.add(p.collection);
    });
    return Array.from(cols);
  }, [categoryProducts]);

  const toggleSubCategory = (sub: string) => {
    setSelectedSubCategories(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleCollection = (col: string) => {
    setSelectedCollections(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const clearAllFilters = () => {
    setSelectedSubCategories([]);
    setSelectedCollections([]);
    setPriceRange(10000);
  };

  // Helper function to safely get date timestamp
  const getSafeDate = (dateValue?: string | Date): number => {
    if (!dateValue) return 0;
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    } catch {
      return 0;
    }
  };

  // Apply filters first
  const filteredByFilters = useMemo(() => {
    return categoryProducts.filter(product => {
      if (selectedSubCategories.length > 0 && !selectedSubCategories.includes(product.subCategory)) {
        return false;
      }
      if (selectedCollections.length > 0 && !selectedCollections.includes(product.collection)) {
        return false;
      }
      if (product.offerPrice > priceRange) {
        return false;
      }
      return true;
    });
  }, [categoryProducts, selectedSubCategories, selectedCollections, priceRange]);

  // Then apply sorting
  const filteredProducts = useMemo(() => {
    const productsCopy = [...filteredByFilters];
    
    switch (sortBy) {
      case 'price-asc':
        return productsCopy.sort((a, b) => (a.offerPrice || a.price) - (b.offerPrice || b.price));
      case 'price-desc':
        return productsCopy.sort((a, b) => (b.offerPrice || b.price) - (a.offerPrice || a.price));
      case 'newest':
        return productsCopy.sort((a, b) => {
          const dateA = getSafeDate(a.createdAt);
          const dateB = getSafeDate(b.createdAt);
          return dateB - dateA;
        });
      case 'popularity':
        return productsCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return productsCopy;
    }
  }, [filteredByFilters, sortBy]);

  const handleShopNow = (e: React.MouseEvent, productToAdd: any) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Shop Now clicked for product:', productToAdd?.id, productToAdd?.name);
    
    if (productToAdd && productToAdd.id) {
      addToCart(productToAdd, 1, productToAdd.variants?.[0] || 'default');
      setToast({ show: true, message: `${productToAdd.name} added to cart` });
      setTimeout(() => setToast({ show: false, message: '' }), 2000);
    } else {
      console.error('Invalid product passed to handleShopNow:', productToAdd);
    }
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="container-custom py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl aspect-3/4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-3xl font-heading font-bold text-primary mb-4">Category Not Found</h1>
        <p className="text-text-secondary mb-8">The category you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary inline-block">Go Home</Link>
      </div>
    );
  }

  // Debug fallback - helps identify mismatches between category name and product categories
  if (!productsLoading && category && categoryProducts.length === 0) {
    // Get all unique product categories to help debug
    const allProductCategories = [...new Set(products.map(p => p.category))];
    
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold text-primary">No products found in {category.name}</h2>
        <p className="text-text-secondary mt-4">
          Check that products in your data/products.ts have category exactly matching "{category.name}"
        </p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
          <p className="font-semibold mb-2">Available product categories in your data:</p>
          <ul className="text-sm text-text-secondary">
            {allProductCategories.map(cat => (
              <li key={cat}>• "{cat}"</li>
            ))}
          </ul>
        </div>
        <Link to="/" className="btn-primary inline-block mt-6">Back to Home</Link>
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

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-secondary mb-8">
        <Link to="/" className="hover:text-accent">Home</Link>
        <ChevronRight size={10} />
        <span className="text-primary font-bold">{category.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Desktop Filters Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-8 hidden lg:block">
          <div>
            <h3 className="font-heading text-xl font-bold text-primary border-b border-gray-100 pb-2 mb-4">Filter By</h3>
            
            <div className="space-y-6">
              {availableSubCategories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">Type</h4>
                  <div className="space-y-2">
                    {availableSubCategories.map(sub => (
                      <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedSubCategories.includes(sub)}
                          onChange={() => toggleSubCategory(sub)}
                          className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent" 
                        />
                        <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {availableCollections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">Collection</h4>
                  <div className="space-y-2">
                    {availableCollections.map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedCollections.includes(col)}
                          onChange={() => toggleCollection(col)}
                          className="w-4 h-4 border-gray-300 rounded text-accent focus:ring-accent" 
                        />
                        <span className="text-sm text-text-secondary group-hover:text-primary transition-colors">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">Price Range</h4>
                <input 
                  type="range" 
                  className="w-full accent-accent" 
                  min="0" 
                  max="10000" 
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                  <span>₹0</span>
                  <span>₹{priceRange.toLocaleString()}+</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          {/* Header and Sorting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary">{category.name}</h1>
              <p className="text-text-secondary text-sm mt-1">
                {filteredProducts.length} Items Found
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-btn text-sm font-medium"
              >
                <Filter size={16} /> Filters
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-text-secondary uppercase tracking-widest font-bold">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Chips */}
          {(selectedSubCategories.length > 0 || selectedCollections.length > 0 || priceRange < 10000) && (
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedSubCategories.map(sub => (
                <span key={sub} className="bg-white border border-gray-200 px-3 py-1 rounded-chip text-[10px] font-bold text-primary flex items-center gap-2">
                  {sub} 
                  <button onClick={() => toggleSubCategory(sub)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              {selectedCollections.map(col => (
                <span key={col} className="bg-white border border-gray-200 px-3 py-1 rounded-chip text-[10px] font-bold text-primary flex items-center gap-2">
                  {col}
                  <button onClick={() => toggleCollection(col)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              {priceRange < 10000 && (
                <span className="bg-white border border-gray-200 px-3 py-1 rounded-chip text-[10px] font-bold text-primary flex items-center gap-2">
                  Under ₹{priceRange.toLocaleString()}
                  <button onClick={() => setPriceRange(10000)}>
                    <X size={10} />
                  </button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-accent text-[10px] font-bold uppercase tracking-widest hover:underline">
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary mb-2">No items found matching your filters.</p>
              <button 
                onClick={clearAllFilters} 
                className="text-accent font-bold mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:hidden">
          <div className="bg-white w-full max-h-[80vh] overflow-y-auto rounded-t-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="font-heading text-xl font-bold text-primary">Filters</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {availableSubCategories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">Type</h4>
                  <div className="space-y-2">
                    {availableSubCategories.map(sub => (
                      <label key={sub} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedSubCategories.includes(sub)}
                          onChange={() => toggleSubCategory(sub)}
                          className="w-4 h-4 rounded text-accent" 
                        />
                        <span className="text-sm">{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {availableCollections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">Collection</h4>
                  <div className="space-y-2">
                    {availableCollections.map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedCollections.includes(col)}
                          onChange={() => toggleCollection(col)}
                          className="w-4 h-4 rounded text-accent" 
                        />
                        <span className="text-sm">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-primary">Price Range</h4>
                <input 
                  type="range" 
                  className="w-full accent-accent" 
                  min="0" 
                  max="10000" 
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                  <span>₹0</span>
                  <span>₹{priceRange.toLocaleString()}+</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              <button 
                onClick={() => setIsMobileFiltersOpen(false)} 
                className="btn-primary w-full"
              >
                Apply Filters ({filteredProducts.length} items)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryListing;