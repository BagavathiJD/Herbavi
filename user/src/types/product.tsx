export interface Product {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  oldPrice: string;
  image: string;
  brand: string;
  badge: string;
  rating: number;
  url: string;
  description: string;
}

export interface CartItem extends Product {
  qty: number;
}
