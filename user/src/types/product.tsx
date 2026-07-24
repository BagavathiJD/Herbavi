export type ProductCategory = 'siddha' | 'ayurveda' | 'unani';

export interface Product {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  oldPrice: string;
  image: string;
  galleryImages: string[];
  measurementLabel: string;
  measurementId?: string;
  measurementValue?: string;
  measurementName?: string;
  brand: string;
  badge: string;
  rating: number;
  url: string;
  description: string;
  category: ProductCategory;
  stock: number;
}

export interface ProductDetailResult {
  product: Product;
  variants: Product[];
}

export interface CartItem extends Product {
  qty: number;
}
