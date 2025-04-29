
export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number; // Making price optional
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  affiliateUrl?: string;
}
