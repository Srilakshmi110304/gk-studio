// types.ts
export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  collection: string;
  occasion: string[];
  price: number;
  offerPrice: number;
  offerPercent: number;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  variants: string[];
  material: string;
  weight: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  images: string[];
  subCategories: string[];  // This comes from sub_categories in DB
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant: string;
}

export interface SiteConfig {
  id: string;
  key: string;
  value: any;
}

export interface HeroImage {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  order: number;
  isActive: boolean;
}