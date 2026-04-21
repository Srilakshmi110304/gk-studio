// components/hooks/useRecentlyViewed.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '../../Context/AuthContext';

const STORAGE_KEY = "recently_viewed";
const MAX_ITEMS = 20;

export const useRecentlyViewed = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addingRef = useRef<Set<string>>(new Set());
  const lastAddedRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (user) {
      loadFromSupabase();
    } else {
      loadFromLocalStorage();
      setLoading(false);
    }
  }, [user]);

  const deduplicateItems = (itemsArray: any[]) => {
    const productMap = new Map<string, any>();
    for (const item of itemsArray) {
      const existing = productMap.get(item.id);
      if (!existing || new Date(item.viewed_at) > new Date(existing.viewed_at)) {
        productMap.set(item.id, item);
      }
    }
    return Array.from(productMap.values()).sort(
      (a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
    );
  };

  const loadFromSupabase = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('recently_viewed')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(MAX_ITEMS);

      if (error) throw error;

      const parsedItems = (data || []).map(item => ({
        id: item.product_id,
        name: item.product_name,
        category: item.category,
        subCategory: item.sub_category,
        collection: item.collection,
        occasion: item.occasion || [],
        price: item.price,
        offerPrice: item.offer_price,
        offerPercent: item.offer_percent,
        images: item.images || [],
        rating: item.rating || 0,
        reviewCount: item.review_count || 0,
        inStock: item.in_stock,
        variants: item.variants || [],
        material: item.material || '',
        weight: item.weight || '',
        description: item.description || '',
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        viewed_at: item.viewed_at
      }));

      const uniqueItems = deduplicateItems(parsedItems).slice(0, MAX_ITEMS);
      setItems(uniqueItems);
    } catch (error) {
      console.error("Error loading recently viewed from Supabase:", error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const unique = deduplicateItems(parsed);
        setItems(unique);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Error parsing recently viewed:", e);
      setItems([]);
    }
  };

  const addItem = useCallback(async (product: any) => {
    if (!product || !product.id) return;

    const now = Date.now();
    const lastAdded = lastAddedRef.current.get(product.id);
    if (lastAdded && (now - lastAdded) < 2000) {
      return;
    }

    if (addingRef.current.has(product.id)) {
      return;
    }

    addingRef.current.add(product.id);
    lastAddedRef.current.set(product.id, now);

    try {
      if (user) {
        // Use upsert with onConflict
        const { error: upsertError } = await supabase
          .from('recently_viewed')
          .upsert({
            user_id: user.id,
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            sub_category: product.subCategory,
            collection: product.collection,
            occasion: product.occasion,
            price: product.price,
            offer_price: product.offerPrice,
            offer_percent: product.offerPercent,
            images: product.images,
            rating: product.rating,
            review_count: product.reviewCount,
            in_stock: product.inStock,
            variants: product.variants,
            material: product.material,
            weight: product.weight,
            description: product.description,
            is_active: product.isActive,
            viewed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id, product_id',
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error("Error upserting recently viewed:", upsertError);
        }

        await loadFromSupabase();
      } else {
        saveToLocalStorage(product);
      }
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      saveToLocalStorage(product);
    } finally {
      setTimeout(() => {
        addingRef.current.delete(product.id);
      }, 500);
    }
  }, [user, loadFromSupabase]);

  const saveToLocalStorage = (product: any) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let current = stored ? JSON.parse(stored) : [];

    current = current.filter((p: any) => p.id !== product.id);

    current.unshift({
      ...product,
      viewed_at: new Date().toISOString()
    });

    current = current.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    const unique = deduplicateItems(current);
    setItems(unique);
  };

  const clearHistory = useCallback(async () => {
    if (user) {
      try {
        await supabase
          .from('recently_viewed')
          .delete()
          .eq('user_id', user.id);
        
        await loadFromSupabase();
      } catch (error) {
        console.error("Error clearing history from Supabase:", error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setItems([]);
    }
  }, [user, loadFromSupabase]);

  const removeItem = useCallback(async (productId: string) => {
    if (user) {
      try {
        await supabase
          .from('recently_viewed')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        await loadFromSupabase();
      } catch (error) {
        console.error("Error removing item from Supabase:", error);
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let current = JSON.parse(stored);
        current = current.filter((p: any) => p.id !== productId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        const unique = deduplicateItems(current);
        setItems(unique);
      }
    }
  }, [user, loadFromSupabase]);

  return { items, loading, addItem, clearHistory, removeItem };
};