
export interface Product {
  id: string;
  name: string;
  short_description: string;
  detailed_description?: string;
  image_url?: string;
  image?: string; // Add for backward compatibility
  description?: string; // Add for backward compatibility
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
  isNew?: boolean;
  is_new?: boolean; // Both property names for compatibility
  isFeatured?: boolean;
  is_featured?: boolean; // Both property names for compatibility
  rating?: number;
  review_count?: number;
  reviewCount?: number; // Both property names for compatibility
  affiliateUrl?: string;
  displayOrder?: number;
  display_order?: number;
}

export interface ProductOrderUpdate {
  id: string;
  display_order: number;
}
