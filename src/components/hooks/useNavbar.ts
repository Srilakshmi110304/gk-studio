// hooks/useNavbar.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

export interface MegaMenuSection {
  section: string;
  items: string[];
  base_path?: string;
}

export interface MenuItem {
  id?: number;
  name: string;
  slug: string;
  enabled: boolean;
  mega_menu?: MegaMenuSection[];
  mega_menu_image?: string;
  mega_menu_badge?: string;
  mega_menu_title?: string;
  mega_menu_cta_text?: string;
  mega_menu_cta_link?: string;
}

export interface NavbarData {
  id?: number;
  logo_text: string;
  subtitle: string;
  menu: MenuItem[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Default navbar data with full mega menu configuration
const DEFAULT_NAVBAR: NavbarData = {
  logo_text: "GK STUDIO",
  subtitle: "Jewellery & Footwear",
  is_active: true,
  menu: [
    { 
      name: "Necklaces", 
      slug: "necklaces", 
      enabled: true,
      mega_menu: [
        {
          section: "Shop By Type",
          items: ["Short Necklaces", "Long Necklaces", "Chokers", "Pendant Sets", "Mangalsutra", "Layered Necklaces"],
          base_path: "/category/necklaces"
        },
        {
          section: "Shop By Collection",
          items: ["Antique", "Kundan", "Temple", "92.5 Silver", "Gold Plated", "Pearl"],
          base_path: "/category/necklaces"
        },
        {
          section: "Shop By Occasion",
          items: ["Bridal", "Festive", "Party", "Office Wear", "Casual", "Engagement"],
          base_path: "/category/necklaces"
        }
      ],
      mega_menu_image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800",
      mega_menu_badge: "NEW COLLECTION",
      mega_menu_title: "The Royal Wedding",
      mega_menu_cta_text: "Shop Now",
      mega_menu_cta_link: "/category/necklaces"
    },
    { 
      name: "Earrings", 
      slug: "earrings", 
      enabled: true,
      mega_menu: [
        {
          section: "Shop By Type",
          items: ["Jhumkas", "Balis/Hoops", "Chandbalis", "Studs", "Danglers", "Ear Cuffs"],
          base_path: "/category/earrings"
        },
        {
          section: "Shop By Collection",
          items: ["Antique", "Kundan", "Temple", "92.5 Silver", "Pearl", "Polki"],
          base_path: "/category/earrings"
        },
        {
          section: "Shop By Occasion",
          items: ["Bridal", "Festive", "Party", "Office Wear", "Casual", "Wedding Guest"],
          base_path: "/category/earrings"
        }
      ]
    },
    { 
      name: "Bangles", 
      slug: "bangles", 
      enabled: true,
      mega_menu: [
        {
          section: "Shop By Type",
          items: ["Kadas", "Single Bangles", "Pair Bangles", "Bracelets", "92.5 Changeable", "Cuff Bangles"],
          base_path: "/category/bangles"
        },
        {
          section: "Shop By Collection",
          items: ["Antique", "Kundan", "Temple", "92.5 Silver", "Enamel", "Stone Work"],
          base_path: "/category/bangles"
        }
      ]
    },
    { 
      name: "Accessories", 
      slug: "accessories", 
      enabled: true,
      mega_menu: [
        {
          section: "Shop By Type",
          items: ["Maang Tikkas", "Hair Brooch", "Hathpans", "Finger Rings", "Nath", "Toe Rings", "Belts", "Nose Pins"],
          base_path: "/category/accessories"
        },
        {
          section: "Shop By Collection",
          items: ["Antique", "Kundan", "Temple", "92.5 Silver", "Pearl", "Bridal Sets"],
          base_path: "/category/accessories"
        }
      ]
    },
    { 
      name: "92.5 silver", 
      slug: "92.5-silver", 
      enabled: true,
      mega_menu: [
        {
          section: "By Category",
          items: ["Complete Sets", "Necklace Sets", "Earring Sets", "Bangle Sets", "Maang Tikka Sets", "Nath Sets"],
          base_path: "/category/92.5-silver"
        },
        {
          section: "By Price",
          items: ["Under ₹999", "₹1000 - ₹2499", "₹2500 - ₹4999", "₹5000 - ₹9999", "Above ₹10000"],
          base_path: "/category/92.5-silver"
        }
      ]
    },
    { 
      name: "Occasions", 
      slug: "occasions", 
      enabled: true,
      mega_menu: [
        {
          section: "Wedding",
          items: ["Bridal Jewellery", "Bridesmaid Sets", "Wedding Guest", "Reception", "Engagement", "Mehendi", "Sangeet"],
          base_path: "/occasion/wedding"
        },
        {
          section: "Festive",
          items: ["Diwali Special", "Navratri", "Durga Puja", "Ganesh Chaturthi", "Eid Special", "Pongal", "Onam"],
          base_path: "/occasion/festive"
        },
        {
          section: "Daily & Party",
          items: ["Office Wear", "Casual Wear", "Party Wear", "Date Night", "Cocktail", "Birthday", "Anniversary"],
          base_path: "/occasion/party"
        }
      ],
      mega_menu_image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800",
      mega_menu_badge: "TRENDING",
      mega_menu_title: "Wedding Season Special",
      mega_menu_cta_text: "Shop Bridal Collection",
      mega_menu_cta_link: "/occasion/wedding"
    },
    { 
      name: "Ortho Footwear", 
      slug: "ortho-footwear", 
      enabled: true,
      mega_menu: [
        {
          section: "By Type",
          items: ["Sandals", "Slippers", "Heels", "Sneakers", "Formal Shoes", "Clogs"],
          base_path: "/category/ortho-footwear"
        },
        {
          section: "By Feature",
          items: ["Arch Support", "Memory Foam", "Diabetic Friendly", "Wide Fit", "Non-Slip", "Adjustable Straps"],
          base_path: "/category/ortho-footwear"
        },
        {
          section: "By Gender",
          items: ["Women's Footwear", "Men's Footwear", "Unisex", "Elderly Care", "Kids Ortho"],
          base_path: "/category/ortho-footwear"
        }
      ]
    }
  ]
};

export const useNavbar = () => {
  const [navbar, setNavbar] = useState<NavbarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        setLoading(true);
        // Try to fetch from Supabase, but fallback to default if it fails
        const { data, error: supabaseError } = await supabase
          .from('navbar')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

        if (supabaseError) {
          console.warn('Error fetching navbar from Supabase, using default:', supabaseError);
          setNavbar(DEFAULT_NAVBAR);
        } else if (!data) {
          setNavbar(DEFAULT_NAVBAR);
        } else {
          setNavbar(data);
        }
      } catch (err) {
        console.error('Error fetching navbar:', err);
        setNavbar(DEFAULT_NAVBAR);
        setError(err instanceof Error ? err.message : 'Failed to load navbar');
      } finally {
        setLoading(false);
      }
    };

    fetchNavbar();
  }, []);

  return { navbar, loading, error };
};