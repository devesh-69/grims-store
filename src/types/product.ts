
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  affiliateUrl?: string;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface ProductOrderUpdate {
  id: string;
  display_order: number;
}
